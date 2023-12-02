import { ChatCompletionCreateParams } from "openai/resources/chat";
import { createClient } from "@supabase/supabase-js";
import { OpenAI } from "openai";

const matches = 12;

const meta: ChatCompletionCreateParams.Function = {
  name: "semanticCodeSearch",
  description: `Performs a semantic code search of the provided repository. Returns chunks of code that are semantically similar to the query. Results are ordred by cosine similarity.

This function accepts 2 arguments:

* Repository (Required): The owner and name of a repository.
* Query (Required): The query to search for.`,
  parameters: {
    type: "object",
    properties: {
      repository: {
        type: "string",
        description:
          "Required. The owner and name of a repository represented as :owner/:name. Do not guess. Confirm with the user if you are unsure.",
      },
      query: {
        type: "string",
        description: "",
      },
    },
    required: ["repository", "query"],
  },
};

async function embedQuery(query: string): Promise<number[]> {
  const input = query.replace(/\n/g, " ");
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const embeddingResponse = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input,
  });

  const [{ embedding }] = embeddingResponse.data;
  return embedding;
}

async function run(repository: string, query: string): Promise<any> {
  const queryEmbedding = await embedQuery(query);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
  const result = await supabase.rpc("repository_search", {
    query_embedding: queryEmbedding,
    similarity_threshold: 0.01,
    match_count: matches,
    query_handle: repository,
  });

  if (!result.data) {
    return "No matches could be found for this query";
  }
  const answer = result.data.map((chunk: any) => {
    return {
      chunk: chunk.chunk,
      path: chunk.path,
      similarity: chunk.similarity,
      title: chunk.title,
    };
  });
  return answer;
}

export default { run, meta };
