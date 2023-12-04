import { JSONSchema } from "openai/lib/jsonschema";
import { FUNCTION_CALLING_MODELS } from "./models";
export type Model = (typeof FUNCTION_CALLING_MODELS)[number];

export type FunctionData = {
  signature: string;
  schema: JSONSchema;
  result: any;
};

export type SettingsProps = {
  customInstructions: string;
  tools: string[];
  model: Model;
};
