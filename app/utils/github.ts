import { Octokit } from "octokit";

const auth = process.env.GITHUB_PAT;
const octokit = new Octokit({ auth });
export async function githubApiRequest<T>(
  endpoint: string,
  parameters: any,
): Promise<T> {
  if (!auth) {
    throw new Error("GitHub PAT Not set!");
  }
  const response = await octokit.request(endpoint, parameters);
  return response as T;
}

export async function searchIssues<T>(q: string, page: number = 1): Promise<T> {
  if (!auth) {
    throw new Error("GitHub PAT Not set!");
  }

  const response = await octokit.rest.search.issuesAndPullRequests({
    q,
    page,
    per_page: 25,
  });

  if (!response) {
    throw new Error("Failed to load commits");
  }
  return response as T;
}

export async function retrieveDiffContents(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github.diff",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch diff contents");
    }

    const diffContents = await response.text();
    return diffContents;
  } catch (error) {
    console.log("Failed to fetch diff contents!");
    console.log(error);
    throw error;
  }
}
