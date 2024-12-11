import { FUNCTION_CALLING_MODELS } from "./models";
export type Model = (typeof FUNCTION_CALLING_MODELS)[number];
import type { ChatCompletionMessageParam } from "openai/resources/chat";
import { FunctionName } from "./api/chat/functions";
export type CustomPrompt = {
  title: string;
  prompt: string;
};

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

export enum Provider {
  OPENAI = "openai",
  AZURE = "azure",
}

export type SettingsProps = {
  customInstructions: string;
  tools: FunctionName[];
  model: string;
  parallelize: boolean;
  provider: Provider;
};

export type CreateProjectV2StatusUpdateInput = {
  projectId: string;
  body: string;
  startDate?: string;
  targetDate?: string;
  status?: "INACTIVE" | "ON_TRACK" | "AT_RISK" | "OFF_TRACK" | "COMPLETE";
};
