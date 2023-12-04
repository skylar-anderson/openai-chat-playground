import { Endpoints } from "@octokit/types";
import { githubApiRequest } from "@/app/utils/github";
import type { ChatCompletionCreateParams } from "openai/resources/chat";

const ENDPOINT = "GET /repos/{owner}/{repo}/issues/{issue_number}/comments";

const meta: ChatCompletionCreateParams.Function = {
  name: "listIssueComments",
  description: `Retrieves a paginated list of comments for a given issue.`,
  parameters: {
    type: "object",
    properties: {
      repository: {
        type: "string",
        description:
          "Required. The owner and name of a repository represented as :owner/:name. Do not guess. Confirm with the user if you are unsure.",
      },
      issue_number: {
        type: "number",
        description: "The issue number to retrieve comments for",
      },
      page: {
        type: "number",
        description: "The page of issue comments to return, defaults to 1",
      },
    },
    required: ["repository", "issue_number"],
  },
};

async function run(repository: string, issue_number: number, page: number = 1) {
  const [owner, repo] = repository.split("/");
  type GetIssueCommentsResponseType = Endpoints[typeof ENDPOINT]["response"];
  try {
    const response = (await githubApiRequest<GetIssueCommentsResponseType>(
      ENDPOINT,
      {
        owner,
        repo,
        issue_number,
        per_page: 10,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    )) as GetIssueCommentsResponseType;

    return response.data.map((comment) => ({
      body: comment.body,
      author_handle: comment.user?.login,
      author_avatar: comment.user?.avatar_url,
      author_email: comment.user?.email,
    }));
  } catch (e) {
    console.log("Failed to fetch issue comments!");
    console.log(e);
    return "An error occured when trying to fetch issue comments.";
  }
}

export default { run, meta };
