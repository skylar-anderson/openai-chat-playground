///repos/{owner}/{repo}/issues
import { githubApiRequest } from "@/app/utils/github";
import { Endpoints } from "@octokit/types";
import type { ChatCompletionCreateParams } from "openai/resources/chat";
const ENDPOINT = "GET /repos/{owner}/{repo}/issues";

const meta: ChatCompletionCreateParams.Function = {
  name: "listIssues",
  description: `
    Returns a list of issues for a given repository. Optionally provide a page
    number to paginate through the results.  Optionally provide an assignee to
    filter issues to a specific user.
  `,
  parameters: {
    type: "object",
    properties: {
      repository: {
        type: "string",
        description:
          "The owner and name of a repository, e.g. facebook/react or vercel/next.js",
      },
      page: {
        type: "number",
        description: "The page of issues to return, defaults to 1",
      },
      assignee: {
        type: "string",
        description:
          "The log in of a user to filter issues by, e.g. mamuso. Pass in 'none' for issues with no assignee and * for issues assigned to any user. If no assignee is provided, it will default to *.",
      },
      state: {
        type: "string",
        description:
          "The state of the issues to return, e.g. open or closed. Defaults to open. Must be one of open, closed, or all.",
      },
    },
    required: ["repository"],
  },
};

type State = "open" | "closed" | "all" | undefined;
type ListIssuesResponse = Endpoints[typeof ENDPOINT]["response"];

async function run(
  repository: string,
  page: number = 1,
  assignee: string = "*",
  state: State = "open",
) {
  const [owner, repo] = repository.split("/");
  try {
    const issues = await githubApiRequest<ListIssuesResponse>(ENDPOINT, {
      owner,
      repo,
      per_page: 10,
      page,
      state,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    return issues.data.map((data) => ({
      assignee_handle: data.assignee?.login,
      assignee_avatar: data.assignee?.avatar_url,
      assignee_url: data.assignee?.html_url,
      assignee_name: data.assignee?.name,
      state: data.state,
      title: data.title,
      body: data.body,
      number: data.number,
      url: data.html_url,
    }));
  } catch (e) {
    console.log("Failed to fetch issues!");
    console.log(e);
    return "An error occured when trying to fetch issues.";
  }
}

export default { run, meta };
