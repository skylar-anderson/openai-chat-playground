import type { ChatCompletionCreateParams } from "openai/resources/chat";
import { createProjectStatusUpdate } from "./projects";

// export type CreateProjectV2StatusUpdateInput = {
//   clientMutationId: string;
//   projectId: string;
//   startDate: string;
//   targetDate: string;
//   status: INACTIVE, ON_TRACK, AT_RISK, OFF_TRACK, COMPLETE;
//   body: string;
// };

const meta: ChatCompletionCreateParams.Function = {
  name: "createProjectStatusUpdate",
  description: `Creates a new status update on a project.`,
  parameters: {
    type: "object",
    properties: {
      projectId: {
        type: "string",
        description: `The id of the project to post the status update to.
          Don't make this up, use the id from the project.`,
      },
      startDate: {
        type: "string",
        description:
          "The start date of the status update. Stored as an epoch timestamp. If this isn't provided, just leave it blank",
      },
      targetDate: {
        type: "string",
        description:
          "The target date of the status update. Stored as an epoch timestamp. If this isn't provided, just leave it blank",
      },
      status: {
        type: "string",
        description:
          "The status of the project. One of INACTIVE, ON_TRACK, AT_RISK, OFF_TRACK, COMPLETE",
      },
      body: {
        type: "string",
        description: "The contents of the status update.",
      },
    },
    required: ["projectId", "status", "body"],
  },
};

//
async function run(
  projectId: string,
  status: "INACTIVE" | "ON_TRACK" | "AT_RISK" | "OFF_TRACK" | "COMPLETE",
  body: string,
  startDate?: string,
  targetDate?: string
): Promise<any> {
  try {
    return await createProjectStatusUpdate({
      projectId,
      startDate,
      targetDate,
      status,
      body,
    });
  } catch (error) {
    return error as any; // any doesn't feel right here but can't figure out the type
  }
}

export default { run, meta };
