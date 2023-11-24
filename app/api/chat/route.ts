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
const systemMessage = {
  // content: `
  //   You are a helpful coding assistant that assists users with coding questions.
  //   You help users find answers to questions related to popular open source libraries.
  //   You have access to functions that load GitHub data. Do not guess which repository
  //   the user is referencing. If you are unsure, ask the user to clarify.
  //   You have access to search all of the world's code.  If there are any questions about
  //   how code works, use one of the functions provided to you to find the answer. Do not
  //   utilize your own knowledge to answer questions. Only use the functions provided to you.
  //   `,
  content: `
    You are a helpful coding assistant that assists users with coding questions
    about the swr react hook.
    You have the ability to perform a semantic code search against the source code of swr.
    Please use this ability to answer questions about how swr works. Do not attempt to
    answer questions using your own knowledge. Only use the functions provided to you.
    `,
  role: "system",
} as ChatCompletionMessageParam;

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
export async function POST(req: Request) {
  const body: RequestProps = await req.json();
  const {
    messages,
    data: { settings },
  } = body;

  const response = await openai.chat.completions.create({
    model: MODEL,
    stream: true,
    messages: [systemMessage, ...messages],
    functions: selectFunctions(settings.tools),
  });

  const data = new experimental_StreamData();
  
  let signature = "NO_FUNCTION_CALLED";
  let result = {};

  const stream = OpenAIStream(response, {
    experimental_onFunctionCall: async (
      { name, arguments: args },
      createFunctionCallMessages,
    ) => {
      const functionResult = await runFunction(name, args);
      const newMessages = createFunctionCallMessages(
        functionResult as JSONValue,
      ) as ChatCompletionMessageParam[];
      signature = `${name}(${signatureFromArgs(args)})`;
      result = functionResult;;

      return openai.chat.completions.create({
        messages: [systemMessage, ...messages, ...newMessages],
        stream: true,
        model: MODEL,
      });
    },
    //onCompletion() {},
    onFinal() {
      data.append({ signature, result });
      data.close();
    },
    experimental_streamData: true,
  });

  return new StreamingTextResponse(stream, {}, data);
}
