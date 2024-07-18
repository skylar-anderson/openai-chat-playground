import type { ChatCompletionCreateParams } from "openai/resources/chat";
import { listProjectViews } from "./projects";

const meta: ChatCompletionCreateParams.Function = {
  name: "listProjectViews",
  description: `Retrieves the views for a particular project`,
  parameters: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "The id of the project to retrieve",
      },
    },
    required: ["id"],
  },
};

async function run(id: string): Promise<any> {
  try {
    const views = await listProjectViews(id);
    return views.map((view) => ({
      id: view.id,
      name: view.name,
      filter: view.filter,
      number: view.number,
      createdAt: view.createdAt,
      updatedAt: view.updatedAt,
      layout: view.layout,
    }));
  } catch (error) {
    return error as any; // any doesn't feel right here but can't figure out the type
  }
}

export default { run, meta };
