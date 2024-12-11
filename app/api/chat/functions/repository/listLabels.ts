import type { ChatCompletionCreateParams } from "openai/resources/chat";
import { gql, GraphQLClient } from "graphql-request";

const auth = process.env.GITHUB_PAT;
const headers = {
  Authorization: `bearer ${auth}`,
};
const endpoint = "https://api.github.com/graphql";
const client = new GraphQLClient(endpoint, { fetch, headers });

export type LabelType = {
  id: string;
  name: string;
  description: string;
};


// DEFINE THE GQL

const listLabelsGQL = gql`
  query {
    repository(owner:"loveland-org", name:"just-testing-issues-experience") {
      labels(first: 100) {
        nodes {
          id
          name
          description
        }
      }
    }
  }
`;


// RUN THE GQL

export async function listLabels(owner: string) {
    const {
      repository: {
        labels: { nodes },
      },
    }: any = await client.request(listLabelsGQL, {
      owner: owner,
    });
    return nodes as LabelType[];
  }


// DEFINE THE FUNCTION FOR THE CHAT

const meta: ChatCompletionCreateParams.Function = {
  name: "listLabels",
  description: `Retrieves the labels for a repository. The labels are returned as an array of objects, each with an id, name, and description.`,
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
    const labels = await listLabels(id);
    return labels.map((label) => ({
      id: label.id,
      name: label.name,
      description: label.description,
    }));
  } catch (error) {
    return error as any; // any doesn't feel right here but can't figure out the type
  }
}

export default { run, meta };