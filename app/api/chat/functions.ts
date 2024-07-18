import listCommits from "./functions/listCommits";
import listRepositoryIssues from "./functions/listRepositoryIssues";
import listIssueComments from "./functions/listIssueComments";
import semanticCodeSearch from "./functions/semanticCodeSearch";
import listPullRequestsForCommit from "./functions/listPullRequestsForCommit";
import retrieveDiffFromSHA from "./functions/retrieveDiffFromSHA";
import retrieveDiffFromPullRequest from "./functions/retrieveDiffFromPullRequest";
import searchWithBing from "./functions/searchWithBing";
import readFile from "./functions/readFile";
import listPullRequests from "./functions/listPullRequests";
import listProjects from "./functions/listProjects";
import getProject from "./functions/getProject";
import listProjectViews from "./functions/listProjectViews";
import listProjectStatusUpdates from "./functions/listProjectStatusUpdates";
import listProjectIssuesPullRequestsDrafts from "./functions/listProjectIssuesPullRequestsDrafts";
import createProjectStatusUpdate from "./functions/createProjectStatusUpdate";
import getIssue from "./functions/getIssue";
import getCommit from "./functions/getCommit";
import addMemory from "./functions/addMemory";
import createIssue from "./functions/createIssue";
import createIssueComment from "./functions/createIssueComment";
import updateIssue from "./functions/updateIssue";
import listDiscussions from "./functions/listDiscussions";
import getDiscussion from "./functions/getDiscussion";
import createPullRequestReview from "./functions/createPullRequestReview";
import analyzeImage from "./functions/analyzeImage";
import type { ChatCompletionCreateParams } from "openai/resources/chat";
export const availableFunctions = {
  analyzeImage,
  createPullRequestReview,
  listDiscussions,
  getDiscussion,
  createIssue,
  createIssueComment,
  updateIssue,
  addMemory,
  getIssue,
  getCommit,
  listPullRequests,
  listProjects,
  getProject,
  listProjectViews,
  listProjectStatusUpdates,
  listProjectIssuesPullRequestsDrafts,
  createProjectStatusUpdate,
  readFile,
  searchWithBing,
  retrieveDiffFromSHA,
  retrieveDiffFromPullRequest,
  semanticCodeSearch,
  listCommits,
  listRepositoryIssues,
  listIssueComments,
  listPullRequestsForCommit,
};
import { type Tool } from "ai";

export type FunctionName = keyof typeof availableFunctions;

export function selectFunctions(
  functions: FunctionName[]
): ChatCompletionCreateParams.Function[] {
  let funcs = [] as ChatCompletionCreateParams.Function[];
  functions.forEach((name) => {
    if (availableFunctions[name]) {
      funcs.push(availableFunctions[name].meta);
    }
  });
  return funcs;
}

export function selectTools(functions: FunctionName[]): Tool[] {
  let tools = [] as Tool[];
  functions.forEach((name) => {
    if (availableFunctions[name]) {
      // @ts-ignore
      tools.push({ type: "function", function: availableFunctions[name].meta });
    }
  });
  return tools;
}

export async function runFunction(name: string, args: any) {
  switch (name) {
    case "analyzeImage":
      return await analyzeImage.run(args["imageUrl"]);
    case "createPullRequestReview":
      return await createPullRequestReview.run(
        args["repository"],
        args["pullNumber"],
        args["body"],
        args["event"],
        args["comments"]
      );
    case "listDiscussions":
      return await listDiscussions.run(args["repository"]);
    case "getDiscussion":
      return await getDiscussion.run(args["repository"], args["id"]);
    case "createIssueComment":
      return await createIssueComment.run(
        args["repository"],
        args["body"],
        args["issueNumber"]
      );
    case "createIssue":
      return await createIssue.run(
        args["repository"],
        args["title"],
        args["body"],
        args["labels"],
        args["assignees"]
      );
    case "updateIssue":
      return await updateIssue.run(
        args["repository"],
        args["issueNumber"],
        args["title"],
        args["body"],
        args["labels"],
        args["assignees"],
        args["state"]
      );
    case "addMemory":
      return await addMemory.run(args["memory"]);
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
        args["pullRequestId"]
      );
    case "retrieveDiffFromSHA":
      return await retrieveDiffFromSHA.run(args["repository"], args["sha"]);
    case "listPullRequestsForCommit":
      return await listPullRequestsForCommit.run(
        args["repository"],
        args["commit_sha"]
      );
    case "listProjectIssuesPullRequestsDrafts":
      return await listProjectIssuesPullRequestsDrafts.run(args["project_id"]);
    case "semanticCodeSearch":
      return await semanticCodeSearch.run(args["repository"], args["query"]);
    case "listCommits":
      return await listCommits.run(
        args["repository"],
        args["path"],
        args["author"],
        args["sha"],
        args["page"]
      );
    case "listRepositoryIssues":
      return await listRepositoryIssues.run(
        "issue",
        args["repository"],
        args["page"],
        args["assignee"],
        args["state"],
        args["label"]
      );
    case "listPullRequests":
      return await listRepositoryIssues.run(
        "pull-request",
        args["repository"],
        args["page"],
        args["assignee"],
        args["state"]
      );
    case "listProjects":
      return await listProjects.run(args["owner"]);
    case "listProjectStatusUpdates":
      return await listProjectStatusUpdates.run(args["id"]);
    case "createProjectStatusUpdate":
      return await createProjectStatusUpdate.run(
        args["projectId"],
        args["status"],
        args["body"],
        args["startDate"],
        args["targetDate"]
      );
    case "getProject":
      return await getProject.run(args["id"]);
    case "listProjectViews":
      return await listProjectViews.run(args["id"]);
    case "listIssueComments":
      return await listIssueComments.run(
        args["repository"],
        args["issue_number"],
        args["page"]
      );
    default:
      throw new Error(`Unknown function: ${name}`);
  }
}
