import type { ChatCompletionCreateParams } from "openai/resources/chat";
import { listDiscussions } from "./discussions";

const meta: ChatCompletionCreateParams.Function = {
  name: "listDiscussions",
  description: `Retrieves a list of discussions for a given repository.`,
  parameters: {
    type: "object",
    properties: {
      repository: {
        type: "string",
        description:
          "Required. The owner and name of a repository represented as :owner/:name. Do not guess. Confirm with the user if you are unsure.",
      },
    },
    required: ["repository"],
  },
};

async function run(repository: string): Promise<any> {
  return listDiscussions(repository);
}

export default { run, meta };
