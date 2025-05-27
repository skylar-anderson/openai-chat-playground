import { githubApiRequest } from "@/app/utils/github";
import { Endpoints } from "@octokit/types";
import type { ChatCompletionCreateParams } from "openai/resources/chat";

const ENDPOINT = "PUT /repos/{owner}/{repo}/contents/{path}";

const meta: ChatCompletionCreateParams.Function = {
  name: "writeFile",
  description: `Writes content to a file in a repository. If the file already exists, it will be updated.`,
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
        description: "Required. The file path to write to.",
      },
      content: {
        type: "string",
        description: "Required. The content to write to the file.",
      },
    },
    required: ["repository", "path", "content"],
  },
};

async function run(repository: string, path: string, content: string) {
  const [owner, repo] = repository.split("/");
  type WriteFileResponse = Endpoints[typeof ENDPOINT]["response"] | undefined;
  
  try {
    // Convert the content to Base64 encoding as required by the GitHub API
    const encodedContent = Buffer.from(content).toString("base64");
    
    const response = await githubApiRequest<WriteFileResponse>(ENDPOINT, {
      owner,
      repo,
      path,
      message: `Update file ${path}`,
      content: encodedContent,
    });
    
    if (response?.status === 201) {
      return "File created successfully";
    } else if (response?.status === 200) {
      return "File updated successfully";
    } else {
      return "Error writing file";
    }
  } catch (error) {
    console.log("Failed to write file!");
    console.log(error);
    return "An error occurred when trying to write the file.";
  }
}

export default { run, meta };