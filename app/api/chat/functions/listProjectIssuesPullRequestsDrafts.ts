import type { ChatCompletionCreateParams } from "openai/resources/chat";
import {
  DraftIssueType,
  IssueType,
  listProjectIssuesPullRequestsDrafts,
  PullRequestType,
} from "./projects";

const meta: ChatCompletionCreateParams.Function = {
  name: "listProjectIssuesPullRequestsDrafts",
  description: `
    Retrieves a list of issues, pulls requests and draft issues for a given project.
    This is NOT for repository level items.
    To run this you require a project id. Never make this up, it should usually start with PVT_.
    If you don't know it view the previous context and see if the project ID is known.
    If you can't find it, say to the user you don't have it, don't guess, this will fail.
  `,
  parameters: {
    type: "object",
    properties: {
      project_id: {
        type: "string",
        description: `
            The id of the project to retrieve
          `,
      },
    },
    required: ["project_id"],
  },
};

async function run(project_id: string): Promise<any> {
  try {
    const items = await listProjectIssuesPullRequestsDrafts(project_id);
    console.log("projectItems:", items);
    return items.map((item) => {
      // if type is instanceOf IssueType
      if (item.type === "ISSUE") {
        const issue = item.content as IssueType;
        return {
          id: item.id,
          title: issue.title,
          number: issue.number,
          repository: `${issue.repository.owner.login}/${issue.repository.name}`,
        };
      }
      if (item.type === "PULL_REQUEST") {
        const pr = item.content as PullRequestType;
        return {
          id: item.id,
          title: pr.title,
          repository: `${pr.repository.owner.login}/${pr.repository.name}`,
        };
      }
      if (item.type === "DRAFT_ISSUE") {
        const draft = item.content as DraftIssueType;
        return {
          id: item.id,
          title: draft.title,
          body: draft.body,
        };
      }
    });
  } catch (error) {
    return error as any; // any doesn't feel right here but can't figure out the type
  }
}

export default { run, meta };
