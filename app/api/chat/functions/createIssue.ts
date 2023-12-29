import { createIssue } from "@/app/utils/github";
import type { ChatCompletionCreateParams } from "openai/resources/chat";

const meta: ChatCompletionCreateParams.Function = {
  name: "createIssue",
  description: `Creates a new issue in a repository.`,
  parameters: {
    type: "object",
    properties: {
      repository: {
        type: "string",
        description:
          "Required. The owner and name of a repository represented as :owner/:name. Do not guess. Confirm with the user if you are unsure.",
      },
      title: {
        type: "string",
        description: "The title of the issue.",
      },
      body: {
        type: "string",
        description: "The contents of the issue.",
      },
      labels: {
        type: "array",
        description: "An array of labels to associate with this issue.",
        items: {
          type: "string",
        },
      },
      assignees: {
        type: "array",
        description:
          "An array of GitHub user handles to assign to this issue. If you omit this parameter, the issue will be assigned to the authenticated user.",
        items: {
          type: "string",
        },
      },
    },
    required: ["repository", "title"],
  },
};

async function run(
  repository: string,
  title: string,
  body: string,
  labels: string[],
  assignees: string[],
) {
  return await createIssue({ repository, title, body, labels, assignees });
}

export default { run, meta };
