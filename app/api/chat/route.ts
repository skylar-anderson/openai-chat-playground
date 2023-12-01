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
  
  This conversation is rendered inside a markdown content area with access to special plugins. See below for guidance on plugin use:

  ### Render notifications with the notification list block
  Use the notification list block to render an interactive block of GitHub notifications. To invoke this block, return a list of notifications urls inside a notificationsList markdown code block. When the markdown is rendered, the URLs provided will be unfurled into interactive notification blocks. The unfurled notifications may contain more helpful data for the user. Here is an example of using a notificationsList block:

\`\`\`notificationsList
  - https://api.github.com/notifications/threads/1
  - https://api.github.com/notifications/threads/2
\`\`\`  
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

  const systemMessage = getSystemMessage(settings.customInstructions);
  console.log(systemMessage);
  // basic completion at start of turn
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
      // a function call was detected
      const functionResult = await runFunction(name, args);
      const newMessages = createFunctionCallMessages(
        functionResult as JSONValue,
      ) as ChatCompletionMessageParam[];

      const signature = `${name}(${signatureFromArgs(args)})`;
      const result = functionResult;
      const schema = selectFunctions([name as FunctionName])[0];
      data.append({ signature, result, schema } as any);

      return openai.chat.completions.create({
        messages: [systemMessage, ...messages, ...newMessages],
        stream: true,
        model: MODEL,
        // providing functions here will allow the model to recursively loop through function calls
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
