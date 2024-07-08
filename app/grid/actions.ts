"use server";
import OpenAI from "openai";
import {
  JSONValue,
  OpenAIStream,
  StreamingTextResponse,
  ToolCallPayload,
  experimental_StreamData,
  Tool,
} from "ai";

const MAX_ROWS = 25;

type PrimaryDataType = "issue" | "commit" | "pull-request" | "snippet" | "item";
type GridCellState = "empty" | "generating" | "done";

export type GridCell = {
  state: GridCellState;
  columnTitle: string;
  columnInstructions: string;
  displayValue: string;
  context: any;
  hydrationSources: string[];
};

export type GridCol = {
  title: string;
  instructions: string;
  cells: GridCell[];
};

export type GridPrimaryCell = {
  context: any;
  displayValue: string;
};

export type GridState = {
  columns: GridCol[];
  primaryColumn: GridPrimaryCell[];
  title: string;
  primaryColumnType: PrimaryDataType;
};

export type ActionResponse = {
  success: boolean;
  grid: GridState;
};

export type SuccessfulPrimaryColumnResponse = {
  success: true;
  grid: GridState;
};

export type ErrorResponse = {
  success: false;
  message: string;
};

function convertResultToPrimaryCell(result: any): GridPrimaryCell {
  return {
    context: result,
    displayValue: result.value || JSON.stringify(result),
  };
}

function signatureFromArgs(args: Record<string, unknown>) {
  return Object.entries(args)
    .map(([key, value]) => `${key}=${value}`)
    .join(", ");
}

import {
  runFunction,
  availableFunctions,
  FunctionName,
} from "../api/chat/functions";

const MODEL = "gpt-4o";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const tools: Tool[] = Object.keys(availableFunctions).map((f) => {
  return {
    type: "function",
    function: availableFunctions[f as FunctionName].meta,
  } as Tool;
});

export async function createPrimaryColumn(
  primaryQuery: string,
): Promise<SuccessfulPrimaryColumnResponse | ErrorResponse> {
  const SYSTEM = `\
  You have access to a number of tools that allow you to retrieve context from GitHub.com.\
  When asked by users, utilize the correct tool to retrieve the data that the user is requesting.\
  You are only able to call one tool per user message. When a tool is used, the result of the tool use will be provided directly to the user.\
  If you are unclear which tool to use, ask the user for clarification. If the user is missing a required argument, ask the user to provide the missing information.\
  \
  `;
  const response = await openai.chat.completions.create({
    model: MODEL,
    stream: false,
    messages: [
      { role: "system", content: SYSTEM },
      { role: "user", content: primaryQuery },
    ],
    tools,
    tool_choice: "auto",
  });

  const responseMessage = response.choices[0].message;

  if (responseMessage?.tool_calls?.length) {
    const toolCall = responseMessage.tool_calls[0];
    const args = JSON.parse(toolCall.function.arguments);

    const toolResult = await runFunction(toolCall.function.name, args);
    let column = (Array.isArray(toolResult) ? toolResult : [toolResult])
      .map(convertResultToPrimaryCell)
      .slice(0, MAX_ROWS);
    const grid = {
      title: primaryQuery,
      columns: [],
      primaryColumn: column,
      primaryColumnType: column[0].context.type || ("Item" as PrimaryDataType),
    };

    return { success: true, grid };
  }

  return {
    success: false,
    message: responseMessage.content || "Something went wrong",
  };
}

type HydrateResponse = {
  promise: Promise<GridCell>;
};

export async function hydrateCell(cell: GridCell): Promise<HydrateResponse> {
  const SYSTEM = `\
  You have access to a number of tools that allow you to retrieve context from GitHub.com.\
  You can optionally use multiple tools, either in sequence or parallel.
  You will receive a user message that contains two things:\n
  1) Context: A JSON object representing some artifact from GitHub.com. It could be an issue, pull request, commit, file, etc
  2) Query: A user-provided query that describes a question that you should answer using the provided artifact\n
  In some cases, the JSON object itself will contain the answer.  In other cases, you will need to use a single tool or a sequence of tools to find the answer.\
  The user interface is not a conversational chat interface, so you should avoid introductions, goodbyes, or any other pleasentries. It's critical that you provide the answer as concisely as possible.

  Markdown rendering is supported, but use it lightly. Only use lists, bold, italics, links. Never use headings.\
`;

  async function hydrate(): Promise<GridCell> {
    let hydrationSources: string[] = [];
    let context: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM },
      {
        role: "user",
        content: `
        Context: ${JSON.stringify(cell.context)}
        Query: ${cell.columnTitle}\n${cell.columnInstructions}
      `,
      },
    ];

    async function run() {
      const response = await openai.chat.completions.create({
        model: MODEL,
        stream: false,
        messages: context,
        tools,
        tool_choice: "auto",
      });
      const responseChoice = response.choices[0];
      const toolCalls = responseChoice.message.tool_calls;

      context.push(responseChoice.message);

      if (toolCalls?.length) {
        const toolCall = toolCalls[0];
        const args = JSON.parse(toolCall.function.arguments);
        const toolResult = await runFunction(toolCall.function.name, args);
        const signature = `${toolCall.function.name}(${signatureFromArgs(
          args,
        )})`;
        hydrationSources.push(signature);
        context.push({
          role: "tool",
          content: JSON.stringify(toolResult),
          tool_call_id: toolCall.id,
        });

        return run();
      }
    }

    await run();

    const assistantResponse = context[context.length - 1].content as string;

    return {
      ...cell,
      state: "done",
      hydrationSources,
      displayValue: assistantResponse,
    };
  }

  // pause to prevent rate limiting
  await new Promise((resolve) => setTimeout(resolve, 200));

  // https://www.youtube.com/watch?v=CDZg3maL9q0
  // this is a hack to allow this action to be called in parallel. Otherwise, each call would be sequential
  return {
    promise: hydrate(),
  };
}
