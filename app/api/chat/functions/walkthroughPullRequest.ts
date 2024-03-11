import { githubApiRequest } from "@/app/utils/github";
import { Endpoints } from "@octokit/types";
import { retrieveDiffContents } from "@/app/utils/github";
import Anthropic from "@anthropic-ai/sdk";
const READ_FILE = "GET /repos/{owner}/{repo}/contents/{path}";
import type { ChatCompletionCreateParams } from "openai/resources/chat";

const meta: ChatCompletionCreateParams.Function = {
  name: "walkthroughPullRequest",
  description: `Retrieves the diff content for a particular pull request and then walks through the content of the diff to provide a summary and answer questions about the diff. Use this to summarize an entire diff.`,
  parameters: {
    type: "object",
    properties: {
      repository: {
        type: "string",
        description:
          "Required. The owner and name of a repository represented as :owner/:name. Do not guess. Confirm with the user if you are unsure.",
      },
      pullRequestId: {
        type: "string",
        description: `The ID of the pull request to walkthrough.`,
      },
    },
    required: ["repository", "pullRequestId"],
  },
};

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

function extractChangedFiles(diff: string): string[] {
  const changedFiles: string[] = [];
  const lines = diff.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("diff --git")) {
      const filePath = line.split(" b/")[1];
      changedFiles.push(filePath);
    }
  }

  return changedFiles;
}

type HydratedFile = {
  content: string;
  path: string;
};

async function hydrateFile(
  repository: string,
  path: string,
): Promise<null | HydratedFile> {
  const [owner, repo] = repository.split("/");
  type ContentsResponse = Endpoints[typeof READ_FILE]["response"] | undefined;
  try {
    const response = await githubApiRequest<ContentsResponse>(READ_FILE, {
      owner,
      repo,
      path,
    });

    //@ts-ignore
    if (!response?.data) {
      return null;
    }

    return {
      // @ts-ignore
      content: Buffer.from(response.data.content, "base64").toString("utf8"),
      path,
    };
  } catch (error) {
    console.log("Failed to load " + path);
    return null;
  }
}

async function generatePrompt(
  owner: string,
  repo: string,
  proposedChanges: string,
): Promise<string> {
  const changedFiles = extractChangedFiles(proposedChanges);
  const files = await Promise.all(
    changedFiles.map((path) => hydrateFile(`${owner}/${repo}`, path)),
  );

  return `
<role>
  You are a world-class software engineer with deep expertise across programming languages, system design, algorithms, and software best practices.
</role>

<task>
  Provide code review feedback on the following code changes. I have provided a list of files along with a diff containing proposed changes to these files. Analyze the proposed changes for consistency with existing code, code quality, design patterns used, performance, maintainability, and adherence to best practices. Suggest thoughtful improvements and optimizations.
</task>

Format your feedback as follows:
<response_format>
  <code_overview>Overview of what the code does</code_overview>
  <code_quality_analysis>
    •Strengths: $strengths
    •Areas for improvement: $areas_for_improvement
  </code_quality_analysis>
  <design_patterns>Design patterns utilized</design_patterns>
  <performance_optimizations>
    1$optimization1
    2$optimization2
    3$optimization3
  </performance_optimizations>

  <maintainability_review>
    •Readability: $readability_score/5
    •Modularity: $modularity_score/5
    •Extensibility: $extensibility_score/5
    •Suggestions: $maintainability_suggestions
  </maintainability_review>

  <best_practices_review>Adherence to $language best practices: $best_practices_score/5</best_practices_review>

  <improvement_recommendations>
    1$recommendation1
    2$recommendation2
    3$recommendation3
  </improvement_recommendations>
</response_format>

<files>
  ${files
    .filter((f) => f !== null)
    .map(
      (f) =>
        `
    <file>
      <name>${f?.path}</name>
      <contents>${f?.content}</contents>
    </file>
    `,
    )}
  
</files>
<proposed_changes>
  ${proposedChanges}
</proposed_changes>
`;
}

async function run(repository: string, pullRequestId: string) {
  const [owner, repo] = repository.split("/");
  const url = `https://github.com/${owner}/${repo}/pull/${pullRequestId}.diff`;

  try {
    const diffContents = await retrieveDiffContents(url);
    //return "The following files were changed in the pull request: " + changedFiles.join(", ") + ".\n\n" + "Now let's walk through the diff and provide a summary.";

    const msg = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: await generatePrompt(owner, repo, diffContents),
            },
          ],
        },
      ],
    });
    return msg.content;
  } catch (error) {
    console.log("Failed to fetch diff content!");
    console.log(error);
    return "An error occured when trying to fetch diff content.";
  }
}

export default { run, meta };
