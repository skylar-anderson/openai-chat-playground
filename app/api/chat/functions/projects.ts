import { CreateProjectV2StatusUpdateInput } from "@/app/types";
import { GraphQLClient, gql } from "graphql-request";

const auth = process.env.GITHUB_PAT;
const headers = {
  Authorization: `bearer ${auth}`,
};
const endpoint = "https://api.github.com/graphql";
const client = new GraphQLClient(endpoint, { fetch, headers });

const projectListQuery = gql`
  query ($owner: String!) {
    organization(login: $owner) {
      projectsV2(first: 10) {
        nodes {
          id
          title
        }
      }
    }
  }
`;

const projectByIdQuery = gql`
  query ($id: ID!) {
    node(id: $id) {
      ... on ProjectV2 {
        fields(first: 20) {
          nodes {
            ... on ProjectV2Field {
              id
              name
            }
            ... on ProjectV2IterationField {
              id
              name
              configuration {
                iterations {
                  startDate
                  id
                }
              }
            }
            ... on ProjectV2SingleSelectField {
              id
              name
              options {
                id
                name
              }
            }
          }
        }
      }
    }
  }
`;

const viewsByProjectID = gql`
  query ($id: ID!) {
    node(id: $id) {
      ... on ProjectV2 {
        views(first: 100) {
          nodes {
            name
            id
          }
        }
      }
    }
  }
`;

const statusUpdatesByProjectID = gql`
  query ($id: ID!) {
    node(id: $id) {
      ... on ProjectV2 {
        statusUpdates(first: 10) {
          edges {
            node {
              id
              body
              createdAt
            }
          }
        }
      }
    }
  }
`;

const postStatusUpdate = gql`
  mutation ($input: CreateProjectV2StatusUpdateInput!) {
    createProjectV2StatusUpdate(input: $input) {
      clientMutationId
    }
  }
`;

const projectItems = gql`
  query ($project_id: ID!) {
    node(id: $project_id) {
      ... on ProjectV2 {
        items(first: 20) {
          nodes {
            id
            fieldValues(first: 8) {
              nodes {
                ... on ProjectV2ItemFieldTextValue {
                  text
                  field {
                    ... on ProjectV2FieldCommon {
                      name
                    }
                  }
                }
                ... on ProjectV2ItemFieldDateValue {
                  date
                  field {
                    ... on ProjectV2FieldCommon {
                      name
                    }
                  }
                }
                ... on ProjectV2ItemFieldSingleSelectValue {
                  name
                  field {
                    ... on ProjectV2FieldCommon {
                      name
                    }
                  }
                }
              }
            }
            content {
              ... on DraftIssue {
                title
                body
              }
              ... on Issue {
                title
                number
                repository {
                  name
                  owner {
                    login
                  }
                }
                assignees(first: 10) {
                  nodes {
                    login
                  }
                }
              }
              ... on PullRequest {
                title
                assignees(first: 10) {
                  nodes {
                    login
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function listProjects(owner: string) {
  try {
    const {
      organization: {
        projectsV2: { nodes },
      },
    }: any = await client.request(projectListQuery, {
      owner: owner,
    });
    return nodes;
  } catch (error: any) {
    console.log("Failed to fetch projects!", error);
    console.log(error);
    return "An error occured when trying to fetch projects.";
  }
}

export async function getProject(id: string) {
  try {
    const {
      node: { fields },
    }: any = await client.request(projectByIdQuery, {
      id: id,
    });
    return fields.nodes;
  } catch (error: any) {
    console.log("Failed to fetch project!", error);
    console.log(error);
    return "An error occured when trying to fetch project.";
  }
}

export async function listProjectViews(id: string) {
  try {
    const {
      node: { views },
    }: any = await client.request(viewsByProjectID, {
      id: id,
    });
    return views.nodes;
  } catch (error: any) {
    console.log("Failed to fetch project views!", error);
    console.log(error);
    return "An error occured when trying to fetch project views.";
  }
}

export async function listProjectStatusUpdates(id: string) {
  try {
    const {
      node: { statusUpdates },
    }: any = await client.request(statusUpdatesByProjectID, {
      id: id,
    });
    return statusUpdates.edges.map((edge: any) => edge.node);
  } catch (error: any) {
    console.log("Failed to fetch project status updates!", error);
    console.log(error);
    return `An error occured when trying to fetch project status updates. ${error.message}`;
  }
}

export async function createProjectStatusUpdate(
  input: CreateProjectV2StatusUpdateInput
) {
  const { startDate, targetDate } = input;
  try {
    // if startDate or targetDate isn't provided, remove them from the input. If they are then convert them to ISO strings
    if (startDate) {
      input.startDate = new Date(parseInt(startDate)).toISOString();
    } else {
      delete input.startDate;
    }
    if (targetDate) {
      input.targetDate = new Date(parseInt(targetDate)).toISOString();
    } else {
      delete input.targetDate;
    }
    const response = await client.request(postStatusUpdate, {
      input: input,
    });
    return response;
  } catch (error: any) {
    console.log("Failed to create project status update!", error);
    console.log(error);
    return `An error occured when trying to create project status update. ${error.message}`;
  }
}

export async function listProjectItems(project_id: string) {
  try {
    const {
      node: { items },
    }: any = await client.request(projectItems, {
      project_id: project_id,
    });
    return items.nodes;
  } catch (error: any) {
    console.log("Failed to fetch project items!", error);
    console.log(error);
    return `An error occured when trying to fetch project items.. ${error.message}`;
  }
}
