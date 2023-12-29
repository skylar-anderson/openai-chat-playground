import { createIssueComment } from "@/app/utils/github";
import type { ChatCompletionCreateParams } from "openai/resources/chat";

const meta: ChatCompletionCreateParams.Function = {
  name: "createIssueComment",
  description: `Adds a comment to an existing issue or pull request.`,
  parameters: {
    type: "object",
    properties: {
      repository: {
        type: "string",
        description:
          "Required. The owner and name of a repository represented as :owner/:name. Do not guess. Confirm with the user if you are unsure.",
      },
      issueNumber: {
        type: "number",
        description: "The number that identifies the issue",
      },
      body: {
        type: "string",
        description: "The contents of the comment.",
      },
    },
    required: ["repository", "body", "issueNumber"],
  },
};

async function run(repository: string, body: string, issueNumber: number) {
  return await createIssueComment({ repository, body, issueNumber });
}

export default { run, meta };
