import { githubApiRequest } from "@/app/utils/github";
import { Endpoints } from "@octokit/types";
import type { ChatCompletionCreateParams } from "openai/resources/chat";
const ENDPOINT = "GET /repos/{owner}/{repo}/issues/{issue_number}";

const meta: ChatCompletionCreateParams.Function = {
  name: "getIssue",
  description: `Retrieves details for a given issue or pull request. On GitHub, issues and pull requests are collectively called "issues", so use this function for retrieving both issues and pull requests by ID.`,
  parameters: {
    type: "object",
    properties: {
      repository: {
        type: "string",
        description:
          "Required. The owner and name of a repository represented as :owner/:name. Do not guess. Confirm with the user if you are unsure.",
      },
      issue_number: {
        type: "string",
        description: "The number that identifies the issue",
      },
    },
    required: ["repository", "issue_number"],
  },
};

async function run(repository: string, issue_number: string) {
  const [owner, repo] = repository.split("/");
  type GetIssueResponse = Endpoints[typeof ENDPOINT]["response"] | undefined;
  try {
    const response = await githubApiRequest<GetIssueResponse>(ENDPOINT, {
      owner,
      repo,
      issue_number,
    });
    if (!response?.data) {
      return "That commit could not be found";
    }
    return {
      body: response.data.body,
      title: response.data.title,
      number: response.data.number,
      state: response.data.state,
      assignee_login: response.data.assignee?.login,
      user_login: response.data.user?.login,
      comments: response.data.comments,
      type: response.data.pull_request ? "pull-request" : "issue",
    };
  } catch (error) {
    console.log("Failed to fetch commit!");
    console.log(error);
    return "An error occured when trying to fetch that commit.";
  }
}

export default { run, meta };
