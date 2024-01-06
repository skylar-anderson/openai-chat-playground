import type { ChatCompletionCreateParams } from "openai/resources/chat";
import { getDiscussion } from "./discussions";

const meta: ChatCompletionCreateParams.Function = {
  name: "getDiscussion",
  description: `Retrieves the contents of a discussion in a repository.`,
  parameters: {
    type: "object",
    properties: {
      repository: {
        type: "string",
        description:
          "Required. The owner and name of a repository represented as :owner/:name. Do not guess. Confirm with the user if you are unsure.",
      },
      id: {
        type: "string",
        description: "The id of the discussion to retrieve",
      },
    },
    required: ["repository", "id"],
  },
};

async function run(repository: string, id: string): Promise<any> {
  return getDiscussion(repository, id);
}

export default { run, meta };
