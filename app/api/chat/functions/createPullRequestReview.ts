import {
  ReviewEvent,
  ReviewCommentType,
  createPullRequestReview,
} from "@/app/utils/github";
import type { ChatCompletionCreateParams } from "openai/resources/chat";

const meta: ChatCompletionCreateParams.Function = {
  name: "createPullRequestReview",
  description: ` This function creates a new pull request review.`,
  parameters: {
    type: "object",
    properties: {
      repository: {
        type: "string",
        description:
          "Required. The owner and name of a repository represented as :owner/:name. Do not guess. Confirm with the user if you are unsure.",
      },
      event: {
        type: "string",
        enum: ["APPROVE", "REQUEST_CHANGES", "COMMENT"],
        description: `The review action to perform.`,
      },
      pullNumber: {
        type: "string",
        description: "The number that identifies the pull request.",
      },
      body: {
        type: "string",
        description:
          "The body text of the pull request review. Use this field for overall comments about the pull request.",
      },
      comments: {
        type: "array",
        description:
          "An array of comments to associate with this review. Comments are specific to lines of code in the diff.",
        items: {
          type: "object",
          properties: {
            path: {
              type: "string",
              description:
                "The relative path to the file that necessitates the comment.",
            },
            position: {
              type: "number",
              description: `The line index in the diff to which the comment applies.
              Note: To comment on a specific line in a file, you need to first determine the position of that line in the diff. The position value equals the number of lines down from the first "@@" hunk header in the file you want to add a comment. The line just below the "@@" line is position 1, the next line is position 2, and so on. The position in the diff continues to increase through lines of whitespace and additional hunks until the beginning of a new file.`,
            },
            body: {
              type: "string",
              description: "The contents of the comment.",
            },
          },
          required: ["path", "body"],
        },
      },
    },
    required: ["body", "repository", "event", "pullNumber", "comments"],
  },
};

async function run(
  repository: string,
  pullNumber: string,
  body: string,
  event: ReviewEvent,
  comments: ReviewCommentType[],
) {
  return await createPullRequestReview({
    repository,
    body,
    pullNumber,
    event,
    comments,
  });
}

export default { run, meta };
