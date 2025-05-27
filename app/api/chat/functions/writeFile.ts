import { githubApiRequest } from "@/app/utils/github";
import { Endpoints } from "@octokit/types";
import type { ChatCompletionCreateParams } from "openai/resources/chat";
const ENDPOINT = "PUT /repos/{owner}/{repo}/contents/{path}";

const meta: ChatCompletionCreateParams.Function = {
  name: "writeFile",
  description: `Creates or updates a file in a repository.`,
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
        description: "Required. The path to the file you want to create or update.",
      },
      content: {
        type: "string",
        description: "Required. The content of the file to write.",
      },
      message: {
        type: "string",
        description: "The commit message. Defaults to 'Update file {path}'",
      },
      branch: {
        type: "string",
        description: "The branch name. Default: the repository's default branch (usually main)",
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
  branch?: string
) {
  const [owner, repo] = repository.split("/");
  type WriteFileResponse = Endpoints[typeof ENDPOINT]["response"] | undefined;
  
  try {
    // Convert content to base64
    const contentBase64 = Buffer.from(content).toString("base64");
    
    // Create default commit message if none provided
    const commitMessage = message || `Update file ${path}`;
    
    const params: any = {
      owner,
      repo,
      path,
      message: commitMessage,
      content: contentBase64,
    };
    
    // Add branch if specified
    if (branch) {
      params.branch = branch;
    }
    
    // Try to get the file first to see if it exists and get the SHA
    try {
      const getFileEndpoint = "GET /repos/{owner}/{repo}/contents/{path}";
      const getFileResponse = await githubApiRequest(getFileEndpoint, {
        owner,
        repo,
        path,
        ...(branch ? { ref: branch } : {}),
      });
      
      if (getFileResponse && getFileResponse.data && !Array.isArray(getFileResponse.data)) {
        // File exists, add the SHA to update it
        params.sha = getFileResponse.data.sha;
      }
    } catch (error) {
      // File doesn't exist, we'll create it
      console.log(`File ${path} doesn't exist, creating it.`);
    }
    
    const response = await githubApiRequest<WriteFileResponse>(ENDPOINT, params);
    
    if (response && response.data) {
      return {
        status: "success",
        message: `File ${path} has been ${params.sha ? 'updated' : 'created'}.`,
        file: response.data,
      };
    }
  } catch (error) {
    console.log("Failed to write file!");
    console.log(error);
    return {
      status: "error",
      message: "An error occurred when trying to write the file.",
      error: String(error)
    };
  }
}

export default { run, meta };