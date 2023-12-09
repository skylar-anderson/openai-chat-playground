import listCommits from "./functions/listCommits";
import listIssues from "./functions/listIssues";
import listIssueComments from "./functions/listIssueComments";
import semanticCodeSearch from "./functions/semanticCodeSearch";
import listPullRequestsForCommit from "./functions/listPullRequestsForCommit";
import retrieveDiffFromSHA from "./functions/retrieveDiffFromSHA";
import retrieveDiffFromPullRequest from "./functions/retrieveDiffFromPullRequest";
import searchWithBing from "./functions/searchWithBing";
import readFile from "./functions/readFile";
import listPullRequests from "./functions/listPullRequests";
import getIssue from "./functions/getIssue";
import getCommit from "./functions/getCommit";
import type { ChatCompletionCreateParams } from "openai/resources/chat";
export const availableFunctions = {
  getIssue,
  getCommit,
  listPullRequests,
  readFile,
  searchWithBing,
  retrieveDiffFromSHA,
  retrieveDiffFromPullRequest,
  semanticCodeSearch,
  listCommits,
  listIssues,
  listIssueComments,
  listPullRequestsForCommit,
};

export type FunctionName = keyof typeof availableFunctions;

export function selectFunctions(
  functions: FunctionName[],
): ChatCompletionCreateParams.Function[] {
  let funcs = [] as ChatCompletionCreateParams.Function[];
  functions.forEach((name) => {
    if (availableFunctions[name]) {
      funcs.push(availableFunctions[name].meta);
    }
  });
  return funcs;
}

export async function runFunction(name: string, args: any) {
  switch (name) {
    case "readFile":
      return await readFile.run(args["repository"], args["path"]);
    case "getCommit":
      return await getCommit.run(args["repository"], args["ref"]);
    case "getIssue":
      return await getIssue.run(args["repository"], args["issue_number"]);
    case "searchWithBing":
      return await searchWithBing.run(args["query"]);
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
      return await semanticCodeSearch.run(args["repository"], args["query"]);
    case "listCommits":
      return await listCommits.run(
        args["repository"],
        args["path"],
        args["author"],
        args["sha"],
        args["page"],
      );
    case "listIssues":
      return await listIssues.run(
        args["repository"],
        args["page"],
        args["assignee"],
        args["state"],
      );
    case "listPullRequests":
      return await listIssues.run(
        args["repository"],
        args["page"],
        args["assignee"],
        args["state"],
        "pull-request",
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
