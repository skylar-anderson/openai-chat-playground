import {
  JSONValue,
  OpenAIStream,
  StreamingTextResponse,
  experimental_StreamData,
} from "ai";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
import { runFunction, selectFunctions, FunctionName } from "./functions";

export const runtime = "edge";
const MODEL = process.env.MODEL_VERSION || "gpt-4-1106-preview";

type RequestProps = {
  messages: ChatCompletionMessageParam[];
  data: { settings: SettingsProps };
};

type SettingsProps = {
  customInstructions: string;
  tools: FunctionName[];
  model: string;
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

export async function POST(req: Request) {
  const body: RequestProps = await req.json();
  const {
    messages,
    data: { settings },
  } = body;
  const functions = selectFunctions(settings.tools) || [];
  const systemMessage = getSystemMessage(settings.customInstructions);
  // basic completion at start of turn
  const response = await openai.chat.completions.create({
    model: settings.model || MODEL,
    stream: true,
    messages: [systemMessage, ...messages],
    functions,
  });

  const data = new experimental_StreamData();

  const stream = OpenAIStream(response, {
    experimental_onFunctionCall: async (
      { name, arguments: args },
      createFunctionCallMessages,
    ) => {
      // a function call was detected
      const functionResult = await runFunction(name, args);
      const newMessages = createFunctionCallMessages(
        functionResult as JSONValue,
      ) as ChatCompletionMessageParam[];

      const signature = `${name}(${signatureFromArgs(args)})`;
      const result = functionResult;
      const schema = functions[0];
      data.append({ signature, result, schema } as any);

      return openai.chat.completions.create({
        messages: [systemMessage, ...messages, ...newMessages],
        stream: true,
        model: MODEL,
        // providing functions here will allow the model to recursively loop through function calls
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
