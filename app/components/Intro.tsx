import { Box } from "@primer/react";
import { PaperAirplaneIcon } from "@primer/octicons-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const source = `### What is this?

This is a prototype of OpenAI function calling with GPT 4 Turbo. [The code behind this prototype](https://github.com/skylar-anderson/openai-chat-playground) is rather simple.  The model is provided a list of retrieval functions, and when prompted, is allowed to recursively call these functions until there is sufficient context to answer the user's question. 

### How to use this prototype:

- Messages are stored in your browser. Clear the conversation by refreshing or clicking the clear button
- Use the input below to start a conversation with Copilot
- On the right, you'll see the functions called by the model. Click on a function to reveal the raw response body and function schema
- Click on the cog icon in the top left to modify settings

### Try it`;

const examples = [
  `what are you?`,
  `summarize the last 3 changes to vercel/ai`,
  `search for all important files related to the Dialog component on primer/react, then retrieve the last commit for each file, then summarize the diff associated with that commit`,
  `summarize comments on the last 3 pull requests to primer/react`,
  `search hackernews and summarize sentiment for vercel and their role in AI development. Then look at the first 3 pages of issues in verce/ai and help me prioritize 3 new milestones.`,
  `In as much detail as possible, summarize the intent behind pr #4035 in primer/react. If possible, use any related issues to find the answer.`,
  `help me select a good first issue with primer/react
  then, use code search to find the most relevant files related to this issue. Then, write 3 suggestions for how I should get started on this issue. Be specific and use code examples.`,
];

type Props = {
  appendMessage: (s: string) => void;
};

export function SuggestedPrompt({
  children,
  onClick,
}: {
  children: string;
  onClick: () => void;
}) {
  return (
    <Box
      sx={{
        paddingY: 2,
        paddingX: 3,
        display: "flex",
        flexDirection: "row",
        gap: 3,
        border: "1px solid",
        borderColor: "border.default",
        backgroundColor: "canvas.default",
        borderRadius: 2,
        width: "fit-content",
        color: "fg.muted",
        "&:hover": {
          backgroundColor: "canvas.subtle",
          cursor: "pointer",
          color: "fg.default",
        },
      }}
      onClick={onClick}
    >
      {children}
      <Box sx={{}}>
        <PaperAirplaneIcon />
      </Box>
    </Box>
  );
}

export default function Intro({ appendMessage }: Props) {
  return (
    <Box
      sx={{
        padding: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        flexGrow: 1,
        overflowY: "scroll",
        paddingBottom: 0,
        width: "100%",
        fontSize: 1,
      }}
    >
      <Box
        sx={{
          p: 3,
          marginRight: "auto",
          marginLeft: "auto",
          maxWidth: "960px",
          backgroundColor: "canvas.default",
        }}
      >
        <Markdown remarkPlugins={[remarkGfm]} className="markdownContainer">
          {source}
        </Markdown>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 3 }}>
          {examples.map((e, i) => (
            <SuggestedPrompt key={i} onClick={() => appendMessage(e)}>
              {e}
            </SuggestedPrompt>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
