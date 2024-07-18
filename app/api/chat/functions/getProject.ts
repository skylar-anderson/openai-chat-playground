import type { ChatCompletionCreateParams } from "openai/resources/chat";
import { getProject } from "./projects";

const meta: ChatCompletionCreateParams.Function = {
  name: "getProject",
  description: `Retrieves the details for a single project from an org. Uses an id (e.g. ABC_a1b2c3) to retrieve the project. The name of the project can't be used (e.g. "My Project").`,
  parameters: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description:
          "The id of the project to retrieve. Looks something like ABC_a1b2c3. Not the name of the project.",
      },
    },
    required: ["id"],
  },
};

async function run(id: string): Promise<any> {
  try {
    const project = await getProject(id);
    return {
      id: project.id,
      title: project.title,
      closed: project.closed,
      closedAt: project.closedAt,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
      public: project.public,
      shortDescription: project.shortDescription,
      url: project.url,
      fields: project.fields,
    };
  } catch (error) {
    return error as any; // any doesn't feel right here but can't figure out the type
  }
}

export default { run, meta };
