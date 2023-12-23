import { JSONSchema } from "openai/lib/jsonschema";
import { FUNCTION_CALLING_MODELS } from "./models";
export type Model = (typeof FUNCTION_CALLING_MODELS)[number];

export type FunctionData = {
  strategy: "parallel" | "serial";
  signature: string;
  schema: JSONSchema;
  result: any;
  elapsedTime: string;
};
export type SettingsProps = {
  customInstructions: string;
  tools: string[];
  model: Model;
  parallelize: boolean;
};
