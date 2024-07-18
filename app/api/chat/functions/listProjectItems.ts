import type { ChatCompletionCreateParams } from "openai/resources/chat";
import { listProjectItems } from "./projects";

const meta: ChatCompletionCreateParams.Function = {
  name: "listProjectItems",
  description: `Retrieves the issues, drafts, and pull requests. Use this when trying to get a list of items in a PROJECT. This isn't for repository level items.`,
  parameters: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: "The id of the project to retrieve",
      },
    },
    required: ["project_id"],
  },
};

async function run(project_id: string): Promise<any> {
  return listProjectItems(project_id);
}

export default { run, meta };
