import { githubApiRequest } from "@/app/utils/github";
import type { ChatCompletionCreateParams } from "openai/resources/chat";

const meta: ChatCompletionCreateParams.Function = {
  name: "dispatchGitHubApiGetRequest",
  description: `Dispatches a GET request to the GitHub API (api.github.com), returning the response body. For APIs that return paginated results, the URL of the next page will also be returned, if applicable. You should call this function additional times, if required, to fetch more results.`,
  parameters: {
    type: "object",
    properties: {
      path_including_querystring: {
        type: "string",
        description:
          "Required. The path to send the request to at https://api.github.com, including any querystring parameters.",
      },
    },
    required: ["path_including_querystring"],
  },
};

const extractNextPageUrl = (linkHeader: string | null): string | null => {
  if (!linkHeader) {
    return null;
  }

  // Split the link header into separate links
  const links = linkHeader.split(',');

  // Find the link for the next page
  const nextPageLink = links.find(link => link.includes('rel="next"'));

  if (!nextPageLink) {
    return null;
  }

  // Extract the URL from the link
  const match = nextPageLink.match(/<(.*)>/);

  return match ? match[1] : null;
}

async function run(pathIncludingQuerystring: string) {
  console.log(`Executing GET ${pathIncludingQuerystring} request`);
  const response = await githubApiRequest<{ data: object, headers: Record<string, string> }>(pathIncludingQuerystring, {});
  console.log(`Got GET ${pathIncludingQuerystring} response: ${JSON.stringify(response.data, null, 2)}`);

  if (response.headers.link && response.headers.link.includes('rel="next"')) {
    return `# Response body\n\n\`\`\`\n${JSON.stringify(response.data, null, 2)}\n\`\`\`# Next page URL\n\n${extractNextPageUrl(response.headers.link)}`;
  } else {
    return `# Response body\n\n\`\`\`\n${JSON.stringify(response.data, null, 2)}\n\`\`\``;
  }
}

export default { run, meta };
