///repos/{owner}/{repo}/issues
import { searchIssues } from "@/app/utils/github";
import { Endpoints } from "@octokit/types";
import type { ChatCompletionCreateParams } from "openai/resources/chat";
const ENDPOINT = "GET /search/issues";

const meta: ChatCompletionCreateParams.Function = {
  name: "listIssues",
  description: `Retrieves a paginated list of issues for a given repository.
  Note: GitHub's REST API considers every pull request an issue, but not every issue is a pull request. For this reason, "Issues" endpoints may return both issues and pull requests in the response. You can identify pull requests by the pull_request key.`,
  parameters: {
    type: "object",
    properties: {
      repository: {
        type: "string",
        description:
          "Required. The owner and name of a repository represented as :owner/:name. Do not guess. Confirm with the user if you are unsure.",
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
  assignee: string,
  state: State = "open",
) {
  const [owner, repo] = repository.split("/");
  try {
    const filters = ["is:issue", `repo:${owner}/${repo}`];
    if (state !== "all") {
      filters.push(`state:${state}`);
    }
    if (assignee) {
      filters.push(`assignee:${assignee}`);
    }

    console.log(filters.join(" "));
    const issues = await searchIssues<ListIssuesResponse>(filters.join(" "));

    console.log(issues.data.items);
    return issues.data.items.map((data) => ({
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
