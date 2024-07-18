import type { ChatCompletionCreateParams } from "openai/resources/chat";
import { listProjectStatusUpdates } from "./projects";

const meta: ChatCompletionCreateParams.Function = {
  name: "listProjectStatusUpdates",
  description: `Retrieves a list of status updates for a project`,
  parameters: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description:
          "Required. The id of the project. Do not guess. Confirm with the user if you are unsure.",
      },
    },
    required: ["id"],
  },
};

async function run(id: string): Promise<any> {
  return listProjectStatusUpdates(id);
}

export default { run, meta };
