import type { ChatCompletionCreateParams } from "openai/resources/chat";
import { gql, GraphQLClient } from "graphql-request";

const auth = process.env.GITHUB_PAT;
const headers = {
  Authorization: `bearer ${auth}`,
};
const endpoint = "https://api.github.com/graphql";
const client = new GraphQLClient(endpoint, { fetch, headers });

export type IssueTemplateType = {
  name: string;
  body: string;
};


// DEFINE THE GQL

const issueTemplatesGQL = gql`
  query {
    repository(owner:"loveland-org", name:"just-testing-issues-experience") {
      issueTemplates {
        name
        body
      }
    }
  }
`;


// RUN THE GQL

export async function listIssueTemplates(owner: string) {
    const {
      repository: {
        issueTemplates
      },
    }: any = await client.request(issueTemplatesGQL, {
      owner: owner,
    });
    return issueTemplates as IssueTemplateType[];
  }


// DEFINE THE FUNCTION FOR THE CHAT

const meta: ChatCompletionCreateParams.Function = {
  name: "listIssueTemplates",
  description: `Retrieves the issue templates for a repository. `,
  parameters: {
    type: "object",
    properties: {
      repository: {
        type: "string",
        description:
          "The name of the repository for which to retrieve the labels. In the format ':owner/:repo'.",
      },
    },
    required: ["repository"],
  },
};

async function run(id: string): Promise<any> {
  try {
    const templates = await listIssueTemplates(id);
    return templates.map((template) => ({
      name: template.name,
      body: template.body,
    }));
  } catch (error) {
    return error as any; // any doesn't feel right here but can't figure out the type
  }
}

export default { run, meta };