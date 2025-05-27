import { writeFile } from "@/app/utils/github";
import type { ChatCompletionCreateParams } from "openai/resources/chat";

const meta: ChatCompletionCreateParams.Function = {
  name: "writeFile",
  description: `Writes or updates content to a file in a repository.`,
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
        description: "Required. The file path where the content should be written",
      },
      content: {
        type: "string",
        description: "Required. The content to write to the file",
      },
      message: {
        type: "string",
        description: "Optional. The commit message to use when creating the commit",
      },
      sha: {
        type: "string",
        description: "Optional. The blob SHA of the file being replaced, required to update an existing file",
      },
    },
    required: ["repository", "path", "content"],
  },
};

async function run(
  repository: string, 
  path: string, 
  content: string, 
  message?: string,
  sha?: string
) {
  return await writeFile({
    repository,
    path,
    content,
    message,
    sha,
  });
}

export default { run, meta };