import { Octokit } from "octokit";
import { Endpoints } from "@octokit/types";
const auth = process.env.GITHUB_PAT;
const octokit = new Octokit({ auth });
const CREATE_ISSUE_ENDPOINT = "POST /repos/{owner}/{repo}/issues";
const CREATE_ISSUE_COMMENT_ENDPOINT =
  "POST /repos/{owner}/{repo}/issues/{issue_number}/comments";
const UPDATE_ISSUE_ENDPOINT =
  "PATCH /repos/{owner}/{repo}/issues/{issue_number}";
const CREATE_PULL_REQUEST_REVIEW_ENDPOINT = `POST /repos/{owner}/{repo}/pulls/{pull_number}/reviews`;

export const headers = {
  "X-GitHub-Api-Version": "2022-11-28",
};

export async function githubApiRequest<T>(
  endpoint: string,
  parameters: any
): Promise<T> {
  if (!auth) {
    throw new Error("GitHub PAT Not set!");
  }
  const response = await octokit.request(endpoint, { ...parameters, headers });
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
        Accept: "application/vnd.github.v3.diff",
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

type IssueProps = {
  repository: string;
  title: string;
  body: string;
  labels: string[];
  assignees: string[];
};

type EditIssueProps = {
  repository: string;
  title?: string;
  body?: string;
  labels?: string[];
  assignees?: string[];
  stateReason?: string;
  state?: "open" | "closed";
  issueNumber: number;
};

export async function updateIssue({
  repository,
  title,
  body,
  labels = [],
  assignees = [],
  stateReason,
  state,
  issueNumber,
}: EditIssueProps) {
  type UpdateIssueResponse =
    | Endpoints[typeof UPDATE_ISSUE_ENDPOINT]["response"]
    | undefined;
  //const [owner, repo] = repository.toLowerCase().split("/");
  // Only create issues in the skylar-anderson/openai-chat-playground repo for now
  try {
    const response = await githubApiRequest<UpdateIssueResponse>(
      UPDATE_ISSUE_ENDPOINT,
      {
        owner: "skylar-anderson",
        repo: "openai-chat-playground",
        title,
        body,
        assignees,
        labels,
        state_reason: stateReason,
        issue_number: issueNumber,
        state,
        headers,
      }
    );
    if (!response?.status) {
      return new Error("Failed to update issue");
    }

    return response;
  } catch (error) {
    console.log("Failed to update issue!");
    console.log(error);
    return error;
  }
}
export type ReviewCommentType = {
  path: string;
  position?: number;
  body: string;
};

export type ReviewEvent = "APPROVE" | "REQUEST_CHANGES" | "COMMENT";

export type ReviewProps = {
  repository: string;
  comments: ReviewCommentType[];
  pullNumber: string;
  event: ReviewEvent;
  body: string;
};

export async function createPullRequestReview({
  repository,
  event,
  body,
  pullNumber,
  comments = [],
}: ReviewProps) {
  type CreatePullRequestReviewResponse =
    | Endpoints[typeof CREATE_PULL_REQUEST_REVIEW_ENDPOINT]["response"]
    | undefined;
  //const [owner, repo] = repository.toLowerCase().split("/");
  // Only create issues in the skylar-anderson/openai-chat-playground repo for now
  try {
    const response = await githubApiRequest<CreatePullRequestReviewResponse>(
      CREATE_PULL_REQUEST_REVIEW_ENDPOINT,
      {
        owner: "skylar-anderson",
        repo: "openai-chat-playground",
        body,
        event,
        pull_number: pullNumber,
        comments,
        headers,
      }
    );
    if (!response?.status) {
      return new Error("Failed to create pull request review");
    }

    return response;
  } catch (error) {
    console.log("Failed to create pull request review!");
    console.log(error);
    return error;
  }
}

export async function createIssue({
  repository,
  title,
  body,
  labels = [],
  assignees = [],
}: IssueProps) {
  type CreateIssueResponse =
    | Endpoints[typeof CREATE_ISSUE_ENDPOINT]["response"]
    | undefined;
  //const [owner, repo] = repository.toLowerCase().split("/");
  // Only create issues in the skylar-anderson/openai-chat-playground repo for now
  try {
    const [owner, name] = repository.split("/");
    const response = await githubApiRequest<CreateIssueResponse>(
      CREATE_ISSUE_ENDPOINT,
      {
        // owner: owner,
        // repo: name,
        owner: "loveland-org", // hardcoding for damage control... just in case
        repo: "Just-testing-issues-experience", // hardcoding for damage control... just in case
        title,
        body,
        assignees,
        labels,
        headers,
      }
    );
    if (!response?.status) {
      return new Error("Failed to create issue");
    }

    return response;
  } catch (error) {
    console.log("Failed to create issue!");
    console.log(error);
    return error;
  }
}

type IssueCommentProps = {
  repository: string;
  issueNumber: number;
  body: string;
};

export async function createIssueComment({
  repository,
  issueNumber,
  body,
}: IssueCommentProps) {
  type CreateIssueCommentResponse =
    | Endpoints[typeof CREATE_ISSUE_COMMENT_ENDPOINT]["response"]
    | undefined;
  //const [owner, repo] = repository.toLowerCase().split("/");
  // Only create issues in the skylar-anderson/openai-chat-playground repo for now
  try {
    const response = await githubApiRequest<CreateIssueCommentResponse>(
      CREATE_ISSUE_COMMENT_ENDPOINT,
      {
        owner: "skylar-anderson",
        repo: "openai-chat-playground",
        issue_number: issueNumber,
        body,
        headers,
      }
    );

    if (!response?.status) {
      return new Error("Failed to create issue comment");
    }

    return response;
  } catch (error) {
    console.log("Failed to create issue comment!");
    console.log(error);
    return error;
  }
}

const GIST_ID = process.env.MEMORY_GIST_ID;
const file = "memory.txt";
const ENDPOINT = "GET /gists/{gist_id}";

export async function getMemory() {
  type GetGistResponse = Endpoints[typeof ENDPOINT]["response"] | undefined;
  try {
    const response = await githubApiRequest<GetGistResponse>(ENDPOINT, {
      gist_id: GIST_ID,
      headers,
    });
    if (!response?.data?.files || !response.data.files[file]) {
      return "Error loading memory";
    }

    return response.data.files[file].content as string;
  } catch (error) {
    console.log("Failed to fetch memory!");
    console.log(error);
    return "An error occured when trying to fetch memory.";
  }
}
