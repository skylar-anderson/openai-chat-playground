import { githubApiRequest } from "@/app/utils/github";
import { Endpoints } from "@octokit/types";
import type { ChatCompletionCreateParams } from "openai/resources/chat";
const ENDPOINT = "GET /repos/{owner}/{repo}/commits/{ref}";

const meta: ChatCompletionCreateParams.Function = {
  name: "getCommit",
  description: `Retrieves details for a given commit:`, 
  parameters: {
    type: "object",
    properties: {
      repository: {
        type: "string",
        description:
          "Required. The owner and name of a repository represented as :owner/:name. Do not guess. Confirm with the user if you are unsure.",
      },
      ref: {
        type: "string",
        description:
          "The commit reference. Can be a commit SHA, branch name (heads/BRANCH_NAME), or tag name (tags/TAG_NAME)",
      },
    },
    required: ["repository", "ref"],
  },
};

async function run(repository: string, ref: string) {
  const [owner, repo] = repository.split("/");
  type GetCommitResponse = Endpoints[typeof ENDPOINT]["response"] | undefined;
  try {
    const response = await githubApiRequest<GetCommitResponse>(ENDPOINT, {
      owner,
      repo,
      ref,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!response?.data) {
      return 'That commit could not be found'
    }
    return {
      stats: response.data.stats,
      message: response.data.commit.message,
      author_name: response.data.commit.author?.name,
      author_email: response.data.commit.author?.email,
      committer_name: response.data.commit.committer?.name,
      committer_email: response.data.commit.committer?.email,
      author_date: response.data.commit.author?.date,
      sha: response.data.sha,
    };
  } catch (error) {
    console.log("Failed to fetch commit!");
    console.log(error);
    return "An error occured when trying to fetch that commit.";
  }
}

export default { run, meta };
