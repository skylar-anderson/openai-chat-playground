import { githubApiRequest } from "@/app/utils/github";
import { Endpoints } from "@octokit/types";
import type { ChatCompletionCreateParams } from "openai/resources/chat";
const ENDPOINT = "GET /repos/{owner}/{repo}/commits";

const meta: ChatCompletionCreateParams.Function = {
  name: "listCommits",
  description: `
    Returns a list of commits for a given repository. Optionally provide
    a page number to paginate through the results. 
  `,
  parameters: {
    type: "object",
    properties: {
      repository: {
        type: "string",
        description:
          "The owner and name of a repository. This is required. Do not guess. Confirm with the user before assuming.",
      },
      page: {
        type: "number",
        description: "The page of commits to return, defaults to 1",
      },
    },
    required: ["repository"],
  },
};

async function run(repository: string, page: number = 1) {
  const [owner, repo] = repository.split("/");
  type ListCommitsResponse = Endpoints[typeof ENDPOINT]["response"] | undefined;
  try {
    const response = await githubApiRequest<ListCommitsResponse>(ENDPOINT, {
      owner,
      repo,
      per_page: 10,
      page,
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
