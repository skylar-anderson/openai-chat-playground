///repos/{owner}/{repo}/issues
import { githubApiRequest } from "@/app/utils/github";
import { Endpoints } from "@octokit/types";
import type { ChatCompletionCreateParams } from "openai/resources/chat";
const ENDPOINT = "GET /repos/{owner}/{repo}/contents/{path}";

const meta: ChatCompletionCreateParams.Function = {
  name: "readFile",
  description: `Retrieves the contents of a file or directory in a repository.`,
  parameters: {
    type: "object",
    properties: {
      repository: {
        type: "string",
        description:
          "Required. The owner and name of a repository represented as :owner/:name. Do not guess. Confirm with the user if you are unsure.",
      },
      path: {
        type: "string",
        description: "The file path to retrieve",
      },
    },
    required: ["repository", "path"],
  },
};

async function run(repository: string, path: string) {
  const [owner, repo] = repository.split("/");
  type ContentsResponse = Endpoints[typeof ENDPOINT]["response"] | undefined;
  try {
    const response = await githubApiRequest<ContentsResponse>(ENDPOINT, {
      owner,
      repo,
      path,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (response && response.data) {
      return response.data;
    }
  } catch (error) {
    console.log("Failed to fetch content!");
    console.log(error);
    return "An error occured when trying to fetch content.";
  }
}

export default { run, meta };
