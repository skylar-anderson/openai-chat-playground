import { githubApiRequest } from "@/app/utils/github";
import { Endpoints } from "@octokit/types";
import type { ChatCompletionCreateParams } from "openai/resources/chat";
const ENDPOINT = "GET /repos/{owner}/{repo}/pulls";

const meta: ChatCompletionCreateParams.Function = {
  name: "listPullRequestsForCommit",
  description: `Lists the merged pull request that introduced the commit to the repository. If the commit is not present in the default branch, will only return open pull requests associated with the commit. To list the open or merged pull requests associated with a branch, you can set the commit_sha parameter to the branch name. This function accepts 2 arguments:

* Repository (Required): The owner and name of a repository.
* commit_sha (Optional): The SHA of the commit to list the pull requests for. Default: the repository's default branch (usually main).`,
  parameters: {
    type: "object",
    properties: {
      repository: {
        type: "string",
        description:
          "Required. The owner and name of a repository represented as :owner/:name. Do not guess. Confirm with the user if you are unsure.",
      },
      commit_sha: {
        type: "string",
        description:
          "SHA of the commit to list the pull requests for. Default: the repository's default branch (usually main).",
      },
    },
  },
};

async function run(repository: string, commit_sha: string) {
  const [owner, repo] = repository.split("/");
  type ListPullRequestsResponse =
    | Endpoints[typeof ENDPOINT]["response"]
    | undefined;
  try {
    const response = await githubApiRequest<ListPullRequestsResponse>(
      ENDPOINT,
      {
        owner,
        repo,
        per_page: 10,
        commit_sha,
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );
    return response?.data.map((pullRequest) => ({
      title: pullRequest.title,
      body: pullRequest.body,
      author_handle: pullRequest.user?.login,
      author_avatar: pullRequest.user?.avatar_url,
      author_email: pullRequest.user?.email,
    }));
  } catch (error) {
    console.error("Failed to fetch pull requests!");
    console.log(error);
    return "An error occured when trying to fetch pull requests for that commit";
  }
}

export default { run, meta };
