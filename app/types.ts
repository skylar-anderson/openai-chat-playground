import { FUNCTION_CALLING_MODELS } from "./models";
export type Model = (typeof FUNCTION_CALLING_MODELS)[number];
import type { ChatCompletionMessageParam } from "openai/resources/chat";

export type CompletionData = {
  debugType: "completion";
  completion: any;
};

export type FunctionData = {
  strategy: "parallel" | "serial";
  signature: string;
  schema: Record<string, any>;
  args: any;
  result: any;
  elapsedTime: string;
  debugType: "function";
};

export type MessageData = {
  debugType: "message";
  messages: ChatCompletionMessageParam[];
};

export type SettingsProps = {
  customInstructions: string;
  tools: string[];
  model: Model;
  parallelize: boolean;
};
