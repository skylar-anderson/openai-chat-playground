import { Message } from "ai";
import { JSONSchema } from "openai/lib/jsonschema";

export type MessageWithDebugData = {
  id: number;
  message: Message;
  debugData: any;
  showFunctionDebugger: boolean;
};

export type FunctionData = {
  signature: string;
  schema: JSONSchema;
  result: any;
};
