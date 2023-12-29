import { FUNCTION_CALLING_MODELS } from "./models";
export type Model = (typeof FUNCTION_CALLING_MODELS)[number];

export type FunctionData = {
  strategy: "parallel" | "serial";
  signature: string;
  schema: string;
  args: any;
  result: any;
  elapsedTime: string;
};
export type SettingsProps = {
  customInstructions: string;
  tools: string[];
  model: Model;
  parallelize: boolean;
};
