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
  * Please use these functions to answer the user's questions when necessary. 
  * If you are unsure about invoking a function, just ask the user to clarify.
  * Be concise and helpful in your responses.
  * Most users are developers. Use technical terms freely and avoid over simplification.
  `;

  const instructions = `
    ${DEFAULT_INSTRUCTIONS}
    ${
      customInstructions
        ? `The user has provided the following additional instructions:${customInstructions}`
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

  const systemMessage = getSystemMessage(settings.customInstructions);

  const response = await openai.chat.completions.create({
    model: MODEL,
    stream: true,
    messages: [systemMessage, ...messages],
    functions: selectFunctions(settings.tools),
  });

  const data = new experimental_StreamData();

  const stream = OpenAIStream(response, {
    experimental_onFunctionCall: async (
      { name, arguments: args },
      createFunctionCallMessages,
    ) => {
      const functionResult = await runFunction(name, args);
      const newMessages = createFunctionCallMessages(
        functionResult as JSONValue,
      ) as ChatCompletionMessageParam[];
      
      const signature = `${name}(${signatureFromArgs(args)})`;
      const result = functionResult;
      const schema = selectFunctions([name as FunctionName])[0];
      data.append({ signature, result, schema });

      return openai.chat.completions.create({
        messages: [systemMessage, ...messages, ...newMessages],
        stream: true,
        model: MODEL,
        functions: selectFunctions(settings.tools),
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
