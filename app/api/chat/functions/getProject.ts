import type { ChatCompletionCreateParams } from "openai/resources/chat";
import { getProject } from "./projects";

const meta: ChatCompletionCreateParams.Function = {
  name: "getProject",
  description: `Retrieves the fields for a project from an org. Uses an id to retrieve the project. The name of the project can't be used`,
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
  return getProject(id);
}

export default { run, meta };
