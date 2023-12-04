import { githubApiRequest } from "@/app/utils/github";
import { Endpoints } from "@octokit/types";
import type { ChatCompletionCreateParams } from "openai/resources/chat";
const ENDPOINT = "GET /repos/{owner}/{repo}/commits";

const meta: ChatCompletionCreateParams.Function = {
  name: "listCommits",
  description: `Retrieves a paginated list of commits for a given repository.`,
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
        description:
          "Optional. Defaults to 1. The page of commits to return, defaults to 1",
      },
      sha: {
        type: "string",
        description:
          "Optional.SHA or branch to start listing commits from. Default: the repository's default branch (usually main).",
      },
      path: {
        type: "string",
        description:
          "Optional. Only commits containing this file path will be returned.",
      },
      author: {
        type: "string",
        description:
          "Optional.GitHub login or email address by which to filter by commit author.",
      },
    },
    required: ["repository"],
  },
};

async function run(
  repository: string,
  path: string,
  author: string,
  sha: string,
  page: number = 1,
) {
  const [owner, repo] = repository.split("/");
  type ListCommitsResponse = Endpoints[typeof ENDPOINT]["response"] | undefined;
  try {
    const response = await githubApiRequest<ListCommitsResponse>(ENDPOINT, {
      owner,
      repo,
      per_page: 10,
      page,
      path,
      author,
      sha,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    return response?.data.map((commit) => ({
      message: commit.commit.message,
      author_name: commit.commit.author?.name,
      author_email: commit.commit.author?.email,
      committer_name: commit.commit.committer?.name,
      committer_email: commit.commit.committer?.email,
      author_date: commit.commit.author?.date,
      sha: commit.sha,
    }));
  } catch (error) {
    console.log("Failed to fetch commits!");
    console.log(error);
    return "An error occured when trying to fetch commits.";
  }
}

export default { run, meta };
