import {
  JSONValue,
  OpenAIStream,
  ToolCallPayload,
  experimental_StreamData,
} from "ai";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat";
import {
  SettingsProps,
  MessageData,
  FunctionData,
  CompletionData,
  Provider,
} from "@/app/types";
import {
  runFunction,
  selectTools,
  selectFunctions,
  FunctionName,
  availableFunctions,
} from "@/app/api/chat/functions";
import { getMemory } from "@/app/utils/github";
import analyzeImage from "@/app/api/chat/functions/analyzeImage";

export function getOpenaiClient(provider: Provider): OpenAI {
  const openaiClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const azureOpenaiClient = new OpenAI({
    apiKey: process.env.AZURE_API_KEY,
    baseURL: process.env.AZURE_MODEL_BASE_URL,
    defaultHeaders: {
      "ocp-apim-subscription-key": process.env.AZURE_API_KEY,
      "api-key": process.env.AZURE_API_KEY,
      "Openai-Internal-HarmonyVersion": "harmony_v3",
      "Openai-Internal-Experimental-AllowToolUse": "true",
    },
  });

  return provider === Provider.AZURE ? azureOpenaiClient : openaiClient;
}

export function signatureFromArgs(args: Record<string, unknown>) {
  return Object.entries(args)
    .map(([key, value]) => `${key}=${value}`)
    .join(", ");
}

export async function getSystemMessage(
  customInstructions: string,
): Promise<ChatCompletionMessageParam> {
  const instructions = `You are a helpful coding assistant that assists users with coding questions.

  * You have been provided a number of functions that load data from GitHub.com. 
  * You have been provided access to perform web searches using Bing
  * Please use these functions to answer the user's questions.
  * For a single user message, you are able to recursively call functions. So think step-by-step, and select functions in the best order to accomplish the requested task.
  * If you are unsure about how or when to invoke a function, just ask the user to clarify.
  * Be concise and helpful in your responses.
  * Most users are developers. Use technical terms freely and avoid over simplification.
  * If the user asks about your capabilities, please respond with a summary based on the list of functions provided to you. Don't worry too much about specific functions, instead give them an overview of how you can use these functions to help the user.  
  * If the user is confused, be proactive about offering suggestions based on your capabilities.
  When you speak to users, you have the ability to record memories about the person and their preferences. Here are the memories you have previously recorded for the current user. Use these memories to improve the users experience:
  ${/*await getMemory()*/ ""}
  ${
    customInstructions
      ? ` The user has provided the following additional instructions:${customInstructions}`
      : ``
  }`;

  return {
    content: instructions,
    role: "system",
  };
}

export function extractFunctionsOrTools(
  settings: SettingsProps,
  imageUrl?: string,
) {
  const isAzure = settings.provider === Provider.AZURE;
  const tools = selectTools(settings.tools);
  const functions = selectFunctions(settings.tools);
  const shouldUseTools = !isAzure && !imageUrl && settings.parallelize;
  return shouldUseTools
    ? {
        tools,
        tool_choice: imageUrl
          ? { type: "function", function: { name: "analyzeImage" } }
          : "auto",
      }
    : {
        functions,
        function_call: imageUrl ? { name: "analyzeImage" } : undefined,
      };
}

export async function handleToolCall(
  call: ToolCallPayload,
  appendToolCallMessage: any,
  data: experimental_StreamData,
  messages: ChatCompletionMessageParam[],
  settings: SettingsProps,
  systemMessage: ChatCompletionMessageParam,
  openai: OpenAI,
  imageUrl?: string,
) {
  const promises = call.tools.map(async (tool) => {
    const { name, arguments: args } = tool.func;
    let result;

    if (name === "analyzeImage" && imageUrl) {
      const mostRecentMessage = messages[messages.length - 1];
      const content = mostRecentMessage.content || "What is this image?";
      result = analyzeImage.run(content.toString(), imageUrl);
    } else {
      result = runFunction(tool.func.name, args);
    }

    const signature = `${name}(${signatureFromArgs(args)})`;
    const schema = availableFunctions[name as FunctionName]?.meta;
    console.log("STARTED: " + signature);
    const startTime = Date.now();
    return result.then((loadedResult) => {
      const endTime = Date.now();
      const elapsedTime = `${endTime - startTime}ms`;
      const debugData: FunctionData = {
        elapsedTime,
        args,
        strategy: "parallel",
        signature,
        result: loadedResult,
        schema,
        debugType: "function",
      };

      data.append(debugData as unknown as JSONValue);

      console.log("FINISHED: " + signature);

      appendToolCallMessage({
        tool_call_id: tool.id,
        function_name: tool.func.name,
        tool_call_result: loadedResult as JSONValue,
      });
    });
  });

  await Promise.all(promises);

  const newMessages: ChatCompletionMessageParam[] = [
    systemMessage,
    ...messages,
    ...(appendToolCallMessage() as OpenAI.Chat.Completions.ChatCompletionMessageParam[]),
  ];

  const messageDebug: MessageData = {
    messages: newMessages,
    debugType: "message",
  };

  data.append(messageDebug as unknown as JSONValue);

  return await openai.chat.completions.create({
    model: settings.model,
    stream: true,
    messages: newMessages,
    tools: selectTools(settings.tools),
    tool_choice: "auto",
  });
}

export async function handleFunctionCall(
  { name, arguments: args }: { name: string; arguments: any },
  createFunctionCallMessages: any,
  data: experimental_StreamData,
  messages: ChatCompletionMessageParam[],
  settings: SettingsProps,
  systemMessage: ChatCompletionMessageParam,
  openai: OpenAI,
  imageUrl?: string,
) {
  const startTime = Date.now();
  const signature = `${name}(${signatureFromArgs(args)})`;

  let result;

  if (name === "analyzeImage" && imageUrl) {
    const mostRecentMessage = messages[messages.length - 1];
    const content = mostRecentMessage.content || "What is this image?";
    result = await analyzeImage.run(content.toString(), imageUrl);
  } else {
    result = await runFunction(name, args);
  }

  const endTime = Date.now();
  const elapsedTime = `${endTime - startTime}ms`;
  const schema = availableFunctions[name as FunctionName]?.meta;
  const debugData: FunctionData = {
    elapsedTime,
    strategy: "serial",
    signature,
    args,
    result,
    schema,
    debugType: "function",
  };

  console.log("STARTED: " + signature);
  data.append(debugData as unknown as FunctionData);

  const newMessages = [
    systemMessage,
    ...messages,
    ...(createFunctionCallMessages(
      result as JSONValue,
    ) as ChatCompletionMessageParam[]),
  ];

  const messageDebug: MessageData = {
    messages: newMessages,
    debugType: "message",
  };

  data.append(messageDebug as unknown as JSONValue);

  return openai.chat.completions.create({
    messages: newMessages,
    stream: true,
    model: settings.model,
    functions: selectFunctions(settings.tools),
  });
}

export async function createOpenAIStream(
  messages: ChatCompletionMessageParam[],
  settings: SettingsProps,
  imageUrl?: string,
) {
  const data = new experimental_StreamData();
  const systemMessage = await getSystemMessage(settings.customInstructions);
  const openai = getOpenaiClient(settings.provider);
  const initialMessages = [systemMessage, ...messages];

  const messageDebug: MessageData = {
    messages: initialMessages,
    debugType: "message",
  };

  data.append(messageDebug as unknown as JSONValue);

  const toolChoices = extractFunctionsOrTools(settings, imageUrl);

  const request = {
    model: settings.model,
    stream: true,
    messages: initialMessages,
    ...toolChoices,
  };

  // @ts-ignore
  const response = await openai.chat.completions.create(request);

  const stream = OpenAIStream(response, {
    experimental_onToolCall: toolChoices.tools
      ? (call, appendToolCallMessage) =>
          handleToolCall(
            call,
            appendToolCallMessage,
            data,
            messages,
            settings,
            systemMessage,
            openai,
            imageUrl,
          )
      : undefined,

    experimental_onFunctionCall: toolChoices.functions
      ? (params, createFunctionCallMessages) =>
          handleFunctionCall(
            params,
            createFunctionCallMessages,
            data,
            messages,
            settings,
            systemMessage,
            openai,
            imageUrl,
          )
      : undefined,
    onCompletion(completion) {
      const completionDebug: CompletionData = {
        debugType: "completion",
        completion,
      };

      data.append(completionDebug as unknown as JSONValue);
    },
    onFinal() {
      data.close();
    },
    experimental_streamData: true,
  });

  return { stream, data };
}
