import type { ChatCompletionCreateParams } from "openai/resources/chat";
const ENDPOINT = "GET /repos/{owner}/{repo}/commits/{ref}";

const meta = {
  name: "getCurrentDateTime",
  description: `Gets the current date and time`,
  parameters: {
    type: "object",
    properties: {},
    required: [],
  },
};

async function run() {
  return new Date().toLocaleString();
}

export default { run, meta };
