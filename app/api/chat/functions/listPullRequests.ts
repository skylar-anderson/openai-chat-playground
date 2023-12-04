import type { ChatCompletionCreateParams } from "openai/resources/chat";

const meta: ChatCompletionCreateParams.Function = {
  name: "listPullRequests",
  description: `Retrieves a paginated list of pull requests for a given repository.`,
  parameters: {
    type: "object",
    properties: {
      repository: {
        type: "string",
        description:
          "Required. The owner and name of a repository represented as :owner/:name. Do not guess. Confirm with the user if you are unsure.",
      },
      page: {
        type: "number",
        description: "The page of issues to return, defaults to 1",
      },
      assignee: {
        type: "string",
        description:
          "The log in of a user to filter issues by, e.g. mamuso. Pass in 'none' for issues with no assignee and * for issues assigned to any user. If no assignee is provided, it will default to *.",
      },
      state: {
        type: "string",
        description:
          "The state of the issues to return, e.g. open or closed. Defaults to open. Must be one of open, closed, or all.",
      },
    },
    required: ["repository"],
  },
};

// no run, just call list issues with is:pull-request
export default { meta };
