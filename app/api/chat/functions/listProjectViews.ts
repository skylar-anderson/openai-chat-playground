import type { ChatCompletionCreateParams } from "openai/resources/chat";
import { listProjectViews } from "./projects";

const meta: ChatCompletionCreateParams.Function = {
  name: "listProjectViews",
  description: `Retrieves the views for a particular project`,
  parameters: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The id of the project to retrieve",
      },
    },
    required: ["id"],
  },
};

async function run(id: string): Promise<any> {
  return listProjectViews(id);
}

export default { run, meta };
