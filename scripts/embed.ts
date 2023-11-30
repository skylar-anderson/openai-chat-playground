import fs from "fs/promises";
import Git from "nodegit";
import { createClient } from "@supabase/supabase-js";
import { OpenAI } from "openai";
import * as matter from "gray-matter";
import { glob } from "glob";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { indexedRepositories } from "../app/repositories";

const splitters = {
  md: RecursiveCharacterTextSplitter.fromLanguage("markdown", {
    chunkSize: 1024,
    chunkOverlap: 32,
  }),
  js: RecursiveCharacterTextSplitter.fromLanguage("js", {
    chunkSize: 1024,
    chunkOverlap: 32,
  }),
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

type EmbedProps = {
  type: "js" | "markdown";
  repo: string;
  owner: string;
  sha: string;
  ref: string;
  fileContent: string;
  filePath: string;
};

async function embedFile({
  type,
  repo,
  owner,
  fileContent,
  filePath,
  sha,
  ref,
}: EmbedProps): Promise<void> {
  let result;
  let content = fileContent;
  let title = filePath.split("/").pop();

  if (type === "js") {
    result = await splitters.js.createDocuments([content]);
  } else if (type === "markdown") {
    const { data, content } = matter.default(fileContent);
    result = await splitters.md.createDocuments([content]);
    if (data.title) {
      title = data.title;
    }
  } else {
    throw new Error("unsupported type");
  }

  for (let i = 0; i < result.length; i++) {
    const document = result[i];
    const chunk = document.pageContent;
    console.log("starting...", filePath, `chunk ${i + 1} of ${result.length}`);

    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: chunk,
    });

    const [{ embedding }] = embeddingResponse.data;
    const { data, error } = await supabase
      .from("search_index")
      .insert({
        title,
        path: filePath,
        ref,
        owner,
        sha,
        repo,
        handle: [owner,repo].join('/'),
        chunk,
        content,
        embedding,
      })
      .select("*");

    if (error) {
      console.log("error", error);
    } else {
      console.log("saved", filePath, i);
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}

async function embedRepo(owner: string, repo: string, ref: string) {
  const cloneUrl = `https://github.com/${owner}/${repo}.git`;
  const checkoutPath = `./tmp-${Date.now()}-${owner}-${repo}`;

  console.log(`Cloning ${repo} into ${checkoutPath}...`);
  const repository = await Git.Clone(cloneUrl, checkoutPath);
  const sha = (await repository.getBranchCommit(ref)).sha();

  console.log(`Clone complete...`);
  console.log(`Embedding content in ${checkoutPath}...`);
  console.log(`With sha: ${ref}:${sha}...`);

  const mdfiles = await glob(`${checkoutPath}/**/*.{md,mdx}`);
  const jsfiles = await glob(`${checkoutPath}/**/*.{js,jsx,ts,tsx}`);

  try {
    await Promise.all(
      jsfiles.map(async (filePath) => {
        const fileContent = await fs.readFile(filePath, "utf8");
        const relativeFilePath = filePath.replace(
          checkoutPath.replace("./", ""),
          "",
        );
        await embedFile({
          type: "js",
          repo,
          owner,
          sha,
          fileContent,
          filePath: relativeFilePath,
          ref,
        });
      }),
    );
    await Promise.all(
      mdfiles.map(async (filePath) => {
        const fileContent = await fs.readFile(filePath, "utf8");
        const relativeFilePath = filePath.replace(
          checkoutPath.replace("./", ""),
          "",
        );

        await embedFile({
          type: "markdown",
          repo,
          owner,
          sha,
          fileContent,
          filePath: relativeFilePath,
          ref,
        });
      }),
    );
  } catch (err) {
    console.error(`Error in embedRepoContent:`, err);
  }

  console.log(`Embedding complete...`);
}

async function main() {
  Object.entries(indexedRepositories).forEach(([repo,ref]) => {
    const [org,repoName] = repo.split('/');
    embedRepo(org,repoName, ref); 
  });
}

main();
