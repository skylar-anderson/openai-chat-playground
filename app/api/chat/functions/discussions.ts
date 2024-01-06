import { GraphQLClient, gql } from "graphql-request";

const auth = process.env.GITHUB_PAT;
const headers = {
  Authorization: `bearer ${auth}`,
};
const endpoint = "https://api.github.com/graphql";
const client = new GraphQLClient(endpoint, { fetch, headers });

const discussionListQuery = gql`
  query ($owner: String!, $name: String!, $first: Int!, $after: String) {
    repository(owner: $owner, name: $name) {
      discussions(first: $first, after: $after) {
        pageInfo {
          endCursor
          hasNextPage
        }
        nodes {
          id
          title
          body
        }
      }
    }
  }
`;

const discussionByIdQuery = gql`
  query ($owner: String!, $name: String!, $number: Int!) {
    repository(owner: $owner, name: $name) {
      discussion(number: $number) {
        comments(first: 50) {
          nodes {
            author {
              login
            }
            body
          }
        }
        id
        title
        body
      }
    }
  }
`;

export async function listDiscussions(repo: string) {
  const [owner, name] = repo.split("/");
  try {
    const {
      repository: { discussions },
    }: any = await client.request(discussionListQuery, {
      owner,
      name,
      first: 10,
      after: null,
    });
    return discussions.nodes;
  } catch (error: any) {
    console.log(error);
    return "An error occured when trying to fetch discussions.";
  }
}

export const getDiscussion = async (repo: string, id: string) => {
  const [owner, name] = repo.split("/");
  try {
    const number = parseInt(id);
    const {
      repository: { discussion },
    }: any = await client.request(discussionByIdQuery, { owner, name, number });
    console.log("GET DISCUSSION");
    console.log(discussion);
    return discussion;
  } catch (e) {
    console.log(e);
    return "An error occured when trying to fetch that discussion.";
  }
};
