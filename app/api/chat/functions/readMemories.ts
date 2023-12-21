import { githubApiRequest } from "@/app/utils/github";
import { Endpoints } from "@octokit/types";
import type { ChatCompletionCreateParams } from "openai/resources/chat";
const ENDPOINT = "GET /gists/{gist_id}";

const meta: ChatCompletionCreateParams.Function = {
  name: "readMemories",
  description: `
    As you are chatting with the user, you will have the ability to read and write memories.
    Use memories to improve the experience of the user over time.
    Use this function to read the memory file.
  `,
  parameters: {
    type: "object",
    properties: {
    },
    required: [],
  },
};

const GIST_ID = process.env.MEMORY_GIST_ID
const file = "memory.txt"

async function run():Promise<string> {
  type GetGistResponse = Endpoints[typeof ENDPOINT]["response"] | undefined;
  try {
    const response = await githubApiRequest<GetGistResponse>(ENDPOINT, {
      gist_id: GIST_ID,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!response?.data?.files || ! response.data.files[file]) { return "Error loading memory" }

    return response.data.files[file].content as string;
  } catch (error) {
    console.log("Failed to fetch memory!");
    console.log(error);
    return "An error occured when trying to fetch memory.";
  }
}

export default { run, meta };