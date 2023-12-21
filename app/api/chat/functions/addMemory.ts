import { githubApiRequest } from "@/app/utils/github";
import { Endpoints } from "@octokit/types";
import type { ChatCompletionCreateParams } from "openai/resources/chat";
import readMemories from "./readMemories";
const ENDPOINT = "PATCH /gists/{gist_id}";

const meta: ChatCompletionCreateParams.Function = {
  name: "addMemory",
  description: `
    As you are chatting with the user, you will have the ability to read and write memories.
    Use memories to improve the experience of the user over time.
    Use this function to save a new memory. Only save memories that you think will be useful in the future.
  `,
  parameters: {
    type: "object",
    properties: {
      memory: {
        type: "string",
        description:
          "Required. The contents of the new memory to save. This will be appended to the existing memory file. Conserve space by being concise and only saving memories that will be useful in the future.",
      },
    },
    required: ["memory"],
  },
};

const GIST_ID = process.env.MEMORY_GIST_ID
const file = "memory.txt"

async function run(memory:string) {
  type GetGistResponse = Endpoints[typeof ENDPOINT]["response"] | undefined;
  const currentMemory = await readMemories.run();
  try {
    const response = await githubApiRequest<GetGistResponse>(ENDPOINT, {
      gist_id: GIST_ID,
      description: 'Copilot wrote a new memory',
      files: {
        [file]: {
          content: `${currentMemory}\n${memory}`
        }
      },
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (response?.status !== 200) { return "Error saving memory" }
    return "Memory saved"
  } catch (error) {
    console.log("Failed to fetch memory!");
    console.log(error);
    return "An error occured when trying to fetch memory.";
  }
}

export default { run, meta };