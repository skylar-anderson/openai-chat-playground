import { Octokit } from "octokit";

const auth = process.env.GITHUB_PAT;
export async function githubApiRequest<T>(
  endpoint: string,
  parameters: any,
): Promise<T> {
  if (!auth) {
    throw new Error("GitHub PAT Not set!");
  }
  const octokit = new Octokit({ auth });
  const response = await octokit.request(endpoint, parameters);
  if (!response) {
    throw new Error("Failed to load commits");
  }
  return response as T;
}
