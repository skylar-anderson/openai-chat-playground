import { updateIssue } from "@/app/utils/github";
import type { ChatCompletionCreateParams } from "openai/resources/chat";

const meta: ChatCompletionCreateParams.Function = {
  name: "updateIssue",
  description: `Edits an existing issue or pull request.`,
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
      state: {
        type: "string",
        enum: ["open", "closed"],
        description: "The open or closed state of the issue",
      },
      stateReason: {
        type: "string",
        enum: ["completed", "not_planned", "reopened"],
        description:
          "The reason for the state change. Ignored unless state is changed.",
      },
      issueNumber: {
        type: "number",
        description: "The number that identifies the issue",
      },
    },
    required: ["repository", "issueNumber"],
  },
};

async function run(
  repository: string,
  issueNumber: number,
  title?: string,
  body?: string,
  labels?: string[],
  assignees?: string[],
  state?: "open" | "closed",
  stateReason?: "completed" | "not_planned" | "reopened",
) {
  return await updateIssue({
    repository,
    title,
    body,
    labels,
    assignees,
    state,
    stateReason,
    issueNumber,
  });
}

export default { run, meta };
