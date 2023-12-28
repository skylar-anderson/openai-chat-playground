import {
  JSONValue,
  OpenAIStream,
  StreamingTextResponse,
  ToolCallPayload,
  experimental_StreamData,
} from "ai";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
import {
  runFunction,
  selectTools,
  selectFunctions,
  FunctionName,
  availableFunctions,
} from "./functions";

export const runtime = "edge";
const MODEL = process.env.MODEL_VERSION || "gpt-4-1106-preview";

type RequestProps = {
  messages: ChatCompletionMessageParam[];
  data: { imageUrl?: string; settings: SettingsProps };
};

type SettingsProps = {
  customInstructions: string;
  tools: FunctionName[];
  model: string;
  parallelize: boolean;
};

function signatureFromArgs(args: Record<string, unknown>) {
  return Object.entries(args)
    .map(([key, value]) => `${key}=${value}`)
    .join(", ");
}

function getSystemMessage(
  customInstructions: string,
): ChatCompletionMessageParam {
  const DEFAULT_INSTRUCTIONS = `
  You are a helpful coding assistant that assists users with coding questions.

  * You have been provided a number of functions that load data from GitHub.com. 
  * You have been provided access to perform web searches using Bing
  * Please use these functions to answer the user's questions.
  * For a single user message, you are able to recursively call functions. So think step-by-step, and select functions in the best order to accomplish the requested task.
  * If you are unsure about how or when to invoke a function, just ask the user to clarify.
  * Be concise and helpful in your responses.
  * Most users are developers. Use technical terms freely and avoid over simplification.
  * If the user asks about your capabilities, please respond with a summary based on the list of functions provided to you. Don't worry too much about specific functions, instead give them an overview of how you can use these functions to help the user.  
  * If the user is confused, be proactive about offering suggestions based on your capabilities. 
`;

  const instructions = `
    ${DEFAULT_INSTRUCTIONS}
    ${
      customInstructions
        ? `The user has provided the following additional instructions:
        ${customInstructions}`
        : ``
    }
  `;

  return {
    content: instructions,
    role: "system",
  };
}

async function handleImageMessage(
  imageUrl: string,
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
  systemMessage: OpenAI.Chat.Completions.ChatCompletionMessageParam,
) {
  const initialMessages = messages.slice(0, -1);
  const currentMessage = messages[messages.length - 1];
  const newMessages = [
    ...initialMessages,
    {
      systemMessage,
      ...currentMessage,
      content: [
        { type: "text", text: currentMessage.content },

        {
          type: "image_url",
          image_url: imageUrl,
        },
      ],
    },
  ] as OpenAI.Chat.Completions.ChatCompletionMessageParam[];

  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    stream: true,
    max_tokens: 2000,
    messages: newMessages,
  });
  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}

export async function POST(req: Request) {
  const body: RequestProps = await req.json();
  const {
    messages,
    data: { imageUrl, settings },
  } = body;
  const systemMessage = getSystemMessage(settings.customInstructions);

  if (imageUrl) {
    return handleImageMessage(imageUrl, messages, systemMessage);
  }

  const tools = selectTools(settings.tools) || [];
  const functions = selectFunctions(settings.tools) || [];
  const response = await openai.chat.completions.create({
    model: settings.model || MODEL,
    stream: true,
    messages: [systemMessage, ...messages],
    tools: settings.parallelize ? tools : undefined,
    tool_choice: settings.parallelize ? "auto" : undefined,
    functions: settings.parallelize ? undefined : functions,
  });

  const data = new experimental_StreamData();

  const stream = OpenAIStream(response, {
    experimental_onToolCall: settings.parallelize
      ? async (call: ToolCallPayload, appendToolCallMessage) => {
          const promises = call.tools.map(async (tool) => {
            const { name, arguments: args } = tool.func;
            const extractedArgs = JSON.parse(args as unknown as string);
            const result = runFunction(tool.func.name, extractedArgs);
            const signature = `${name}(${signatureFromArgs(extractedArgs)})`;
            const schema = availableFunctions[name as FunctionName]?.meta;
            console.log("STARTED: " + signature);
            const startTime = Date.now();
            return result.then((loadedResult) => {
              const endTime = Date.now();
              const elapsedTime = `${endTime - startTime}ms`;
              data.append({
                elapsedTime,
                args: extractedArgs,
                strategy: "parallel",
                signature,
                result: loadedResult,
                schema,
              } as any);
              console.log("FINISHED: " + signature);
              appendToolCallMessage({
                tool_call_id: tool.id,
                function_name: tool.func.name,
                tool_call_result: loadedResult as JSONValue,
              });
            });
          });

          await Promise.all(promises);

          return await openai.chat.completions.create({
            model: MODEL,
            stream: true,
            messages: [
              systemMessage,
              ...messages,
              ...(appendToolCallMessage() as OpenAI.Chat.Completions.ChatCompletionMessageParam[]),
            ],
            tools,
            tool_choice: "auto",
          });
        }
      : undefined,

    experimental_onFunctionCall: settings.parallelize
      ? undefined
      : async ({ name, arguments: args }, createFunctionCallMessages) => {
          const startTime = Date.now();
          const functionResult = await runFunction(name, args);
          const newMessages = createFunctionCallMessages(
            functionResult as JSONValue,
          ) as ChatCompletionMessageParam[];

          const signature = `${name}(${signatureFromArgs(args)})`;
          const result = functionResult;
          const endTime = Date.now();
          const elapsedTime = `${endTime - startTime}ms`;
          const schema = functions.filter((f) => f.name === name);
          data.append({
            elapsedTime,
            strategy: "serial",
            signature,
            args,
            result,
            schema,
          } as any);

          return openai.chat.completions.create({
            messages: [systemMessage, ...messages, ...newMessages],
            stream: true,
            model: MODEL,
            functions,
          });
        },
    //onCompletion() {},
    onFinal() {
      data.close();
    },
    experimental_streamData: true,
  });

  return new StreamingTextResponse(stream, {}, data);
}
