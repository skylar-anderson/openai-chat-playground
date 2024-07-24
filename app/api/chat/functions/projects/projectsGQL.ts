import { CreateProjectV2StatusUpdateInput } from "@/app/types";
import { GraphQLClient, gql } from "graphql-request";

const auth = process.env.GITHUB_PAT;
const headers = {
  Authorization: `bearer ${auth}`,
};
const endpoint = "https://api.github.com/graphql";
const client = new GraphQLClient(endpoint, { fetch, headers });

export type ProjectType = {
  id: string;
  title: string;
  closed: string;
  closedAt: string;
  createdAt: string;
  public: string;
  shortDescription: string;
  updatedAt: string;
  url: string;
  fields?: FieldType[];
};

export type FieldType = {
  id: string;
  name: string;
  updatedAt: string;
  options?: any; // to do- add specific types for iteration/single select fields
};

export type ViewType = {
  name: string;
  id: string;
  filter: string;
  number: number;
  createdAt: string;
  updatedAt: string;
  layout: string;
};

export type StatusUpdate = {
  id: string;
  project: string;
  startDate: string;
  targetDate: string;
  updatedAt: string;
  body: string;
  createdAt: string;
  // creator: {
  //   login: string;
  // };
  status: string;
};

export type ProjectItem = {
  id: string;
  type: "ISSUE" | "PULL_REQUEST" | "DRAFT_ISSUE" | "REDACTED";
  content: DraftIssueType | IssueType | PullRequestType;
};

export type DraftIssueType = {
  title: string;
  body: string;
};

export type IssueType = {
  title: string;
  number: number;
  repository: {
    name: string;
    owner: {
      login: string;
    };
  };
  assignees: {
    nodes: {
      login: string;
    }[];
  };
};

export type PullRequestType = {
  title: string;
  number: number;
  repository: {
    name: string;
    owner: {
      login: string;
    };
  };
};

const projectListQuery = gql`
  query ($owner: String!) {
    organization(login: $owner) {
      projectsV2(first: 10) {
        nodes {
          id
          title
          closed
          closedAt
          createdAt
          public
          shortDescription
          updatedAt
          url
        }
      }
    }
  }
`;

const projectByIdQuery = gql`
  query ($id: ID!) {
    node(id: $id) {
      ... on ProjectV2 {
        id
        title
        closed
        closedAt
        createdAt
        public
        shortDescription
        updatedAt
        url
        fields(first: 20) {
          nodes {
            ... on ProjectV2Field {
              id
              name
              updatedAt
            }
            ... on ProjectV2IterationField {
              id
              name
              updatedAt
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
              updatedAt
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
            filter
            number
            createdAt
            updatedAt
            layout
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
            type
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
  const {
    organization: {
      projectsV2: { nodes },
    },
  }: any = await client.request(projectListQuery, {
    owner: owner,
  });
  return nodes as ProjectType[];
}

export async function getProject(id: string) {
  const { node }: any = await client.request(projectByIdQuery, {
    id: id,
  });
  return node as ProjectType;
}

export async function listProjectViews(id: string) {
  const {
    node: { views },
  }: any = await client.request(viewsByProjectID, {
    id: id,
  });
  return views.nodes as ViewType[];
}

export async function listProjectStatusUpdates(id: string) {
  const {
    node: { statusUpdates },
  }: any = await client.request(statusUpdatesByProjectID, {
    id: id,
  });
  return statusUpdates.edges.map((edge: any) => edge.node) as StatusUpdate[];
}

export async function createProjectStatusUpdate(
  input: CreateProjectV2StatusUpdateInput
) {
  const { startDate, targetDate } = input;
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
}

export async function listProjectIssuesPullRequestsDrafts(project_id: string) {
  const {
    node: { items },
  }: any = await client.request(projectItems, {
    project_id: project_id,
  });
  return items.nodes as ProjectItem[];
}
