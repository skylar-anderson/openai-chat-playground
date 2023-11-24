import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, StreamingTextResponse, Message } from "ai";
import { functions, runFunction } from "./app/api/chat/functions";

//const MODEL = 'gpt-3.5-turbo-16k-0613';
//const MODEL = 'gpt-4-0613';
const MODEL = "gpt-4-1106-preview";
// Create an OpenAI API client (that's edge friendly!)
const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

const systemMessage = {
  content: `
    You are a helpful assistant that works for GitHub.
    You help users find answers to questions related to popular open source libraries.
    You have access to functions that load GitHub data. Do not guess which repository
    the user is referencing. If you are unsure, ask the user to clarify.
    You have access to search all of the world's code.  If there are any questions about
    how code works, use one of the functions provided to you to find the answer. Do not 
    utilize your own knowledge to answer questions.  Only use the functions provided to you.
    `,
  role: "system",
};

export async function handleNewSubmission(messages: Message[]) {
  const newMessages = [
    systemMessage,
    ...messages.map((message: any) => ({
      content: message.content,
      role: message.role,
    })),
  ];
  console.log(newMessages);
  const initialResponse = await openai.createChatCompletion({
    model: MODEL,
    // stream: true, streaming breaks function calling.  Enable this later
    messages: newMessages,
    function_call: "auto",
    functions,
  });

  const initialResponseJson = await initialResponse.json();
  const initialResponseMessage = initialResponseJson?.choices?.[0]?.message;

  return initialResponseMessage.function_call
    ? handleFunctionCallResponse(initialResponseMessage, messages)
    : handleTextResponse(initialResponseMessage, messages);
}

export async function handleFunctionCallResponse(
  initialResponseMessage: any,
  messages: any,
) {
  // Source: https://twitter.com/steventey/status/1673041790272954369
  // This is a hack that requires disabling response streaming
  // TODO: wait on https://github.com/vercel-labs/ai/pull/178 and update
  // to do this properly
  const { name, arguments: args } = initialResponseMessage.function_call;
  const functionResponse = await runFunction(name, JSON.parse(args));
  let finalResponse;

  try {
    finalResponse = await openai.createChatCompletion({
      model: MODEL,
      stream: true,
      messages: [
        ...messages,
        initialResponseMessage,
        {
          role: "function",
          name: initialResponseMessage.function_call.name,
          content: JSON.stringify(functionResponse),
        },
      ],
    });
    console.log(initialResponseMessage);
    const stream = OpenAIStream(finalResponse);
    return new StreamingTextResponse(stream);
  } catch (e) {
    console.log(
      "Error occured when attempting to handle function calling response",
    );
    console.log(finalResponse);
  }
}

export function handleTextResponse(initialResponseMessage: any, messages: any) {
  // if there's no function call, just return the initial response
  // but first, we gotta convert initialResponse into a stream with ReadableStream
  const chunks = initialResponseMessage.content.split(" ");
  const stream = new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        const bytes = new TextEncoder().encode(chunk + " ");
        controller.enqueue(bytes);
        await new Promise((r) =>
          setTimeout(
            r,
            // get a random number between 10ms and 30ms to simulate a random delay
            Math.floor(Math.random() * 20 + 10),
          ),
        );
      }
      controller.close();
    },
  });
  return new StreamingTextResponse(stream);
}
