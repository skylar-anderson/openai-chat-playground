import type { ChatCompletionCreateParams } from "openai/resources/chat";
import { listProjects, ProjectType } from "./projects";
import { url } from "inspector";

const meta: ChatCompletionCreateParams.Function = {
  name: "listProjects",
  description: `Retrieves a list of projects. The ID that is returned is the ID of the project. This ID might be needed to retrieve other project details.`,
  parameters: {
    type: "object",
    properties: {
      owner: {
        type: "string",
        description:
          "Required. The owner of the project, this is the organization. Do not guess. Confirm with the user if you are unsure.",
      },
    },
    required: ["owner"],
  },
};

async function run(owner: string): Promise<ProjectType[]> {
  try {
    const projects = await listProjects(owner);
    return projects.map((project) => ({
      id: project.id,
      title: project.title,
      closed: project.closed,
      closedAt: project.closedAt,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      public: project.public,
      shortDescription: project.shortDescription,
      url: project.url,
    }));
  } catch (error) {
    return error as any; // any doesn't feel right here but can't figure out the type
  }
}

export default { run, meta };
