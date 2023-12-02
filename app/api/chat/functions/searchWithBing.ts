import type { ChatCompletionCreateParams } from "openai/resources/chat";
import { retrieveDiffContents } from "@/app/utils/github";
const meta: ChatCompletionCreateParams.Function = {
  name: "searchWithBing",
  description: `Performs a Bing web search. Use this function when directly asked or when recent events are necessary to answer the users question.`,
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Required. The query to search for.",
      },
    },
    required: ["query"],
  },
};

async function run(query: string) {
  const ENDPOINT = process.env.BING_SEARCH_ENDPOINT;
  const KEY = process.env.BING_SEARCH_SUBSCRIPTION_KEY;

  if (!ENDPOINT || !KEY) {
    return "unable to make bing request";
  }

  try {
    const url = new URL(ENDPOINT);
    url.searchParams.append("mkt", "en-US");
    url.searchParams.append("q", query);
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Ocp-Apim-Subscription-Key": KEY,
      },
    });
    console.log(response);
    if (!response.ok) {
      throw new Error("Failed to search bing");
    }

    const json = await response.json();
    const pages = json.webPages.value.map((result: any) => {
      return {
        title: result.name,
        url: result.url,
        description: result.snippet,
      };
    });
    return {
      pages,
      webSearchUrl: json.webSearchUrl,
      totalEstimatedMatches: json.webPages.totalEstimatedMatches,
    };
  } catch (error) {
    console.log("Failed to search bing!");
    console.log(error);
    throw error;
  }
}

export default { run, meta };
