import listCommits from "./functions/listCommits";
import listIssues from "./functions/listIssues";
import listIssueComments from "./functions/listIssueComments";
import semanticCodeSearch from "./functions/semanticCodeSearch";
import listPullRequestsForCommit from "./functions/listPullRequestsForCommit";
import retrieveDiffFromSHA from "./functions/retrieveDiffFromSHA";
import retrieveDiffFromPullRequest from "./functions/retrieveDiffFromPullRequest";
import listNotifications from "./functions/listNotifications";
export const availableFunctions = {
  listNotifications,
  retrieveDiffFromSHA,
  retrieveDiffFromPullRequest,
  semanticCodeSearch,
  listCommits,
  listIssues,
  listIssueComments,
  listPullRequestsForCommit,
};

export type FunctionName = keyof typeof availableFunctions;

export function selectFunctions(functions: FunctionName[]) {
  return functions.map((name) => {
    return availableFunctions[name].meta;
  });
}

export async function runFunction(name: string, args: any) {
  switch (name) {
    case "listNotifications":
      return await listNotifications.run(
        args["all"],
        args["participating"],
        args["page"],
      );
    case "retrieveDiffFromPullRequest":
      return await retrieveDiffFromPullRequest.run(
        args["repository"],
        args["pullRequestId"],
      );
    case "retrieveDiffFromSHA":
      return await retrieveDiffFromSHA.run(args["repository"], args["sha"]);
    case "listPullRequestsForCommit":
      return await listPullRequestsForCommit.run(
        args["repository"],
        args["commit_sha"],
      );
    case "semanticCodeSearch":
      return await semanticCodeSearch.run(args["query"]);
    case "listCommits":
      return await listCommits.run(args["repository"], args["page"]);
    case "listIssues":
      return await listIssues.run(
        args["repository"],
        args["page"],
        args["assignee"],
        args["state"],
      );
    case "listIssueComments":
      return await listIssueComments.run(
        args["repository"],
        args["issue_number"],
        args["page"],
      );
    default:
      throw new Error(`Unknown function: ${name}`);
  }
}
