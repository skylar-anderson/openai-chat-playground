import type { ChatCompletionCreateParams } from "openai/resources/chat";
import { retrieveDiffContents } from "@/app/utils/github";
const meta: ChatCompletionCreateParams.Function = {
  name: "retrieveDiffFromSHA",
  description: `Retrieves the diff content for a particular commit or branch.`,
  parameters: {
    type: "object",
    properties: {
      repository: {
        type: "string",
        description:
          "Required. The owner and name of a repository represented as :owner/:name. Do not guess. Confirm with the user if you are unsure.",
      },
      sha: {
        type: "string",
        description:
          "SHA or branch to start listing commits from. Default: the repository's default branch (usually main).",
      },
    },
    required: ["repository", "sha"],
  },
};

async function run(repository: string, sha: string) {
  const [owner, repo] = repository.split("/");
  const url = `https://github.com/${owner}/${repo}/commit/${sha}.diff`;

  try {
    const diffContents = await retrieveDiffContents(url);
    return diffContents;
  } catch (error) {
    console.log("Failed to fetch diff content!");
    console.log(error);
    return "An error occured when trying to fetch diff content.";
  }
}

export default { run, meta };
