import type { ChatCompletionCreateParams } from "openai/resources/chat";
import { listProjectStatusUpdates } from "./projects";

const meta: ChatCompletionCreateParams.Function = {
  name: "listProjectStatusUpdates",
  description: `Retrieves a list of status updates for a project`,
  parameters: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description:
          "Required. The id of the project. Do not guess. Confirm with the user if you are unsure.",
      },
    },
    required: ["id"],
  },
};

async function run(id: string): Promise<any> {
  try {
    const statusUpdates = await listProjectStatusUpdates(id);
    console.log("statusUpdates", statusUpdates);
    return statusUpdates.map((statusUpdate) => ({
      id: statusUpdate.id,
      projectId: statusUpdate.project,
      startDate: statusUpdate.startDate,
      targetDate: statusUpdate.targetDate,
      status: statusUpdate.status,
      body: statusUpdate.body,
      createdAt: statusUpdate.createdAt,
      updatedAt: statusUpdate.updatedAt,
      // author: statusUpdate.creator.login,
    }));
  } catch (error) {
    return error as any; // any doesn't feel right here but can't figure out the type
  }
}

export default { run, meta };
