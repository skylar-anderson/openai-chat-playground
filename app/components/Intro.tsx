import { Box } from "@primer/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const source = `### How to use this prototype:

- Messages are stored in your browser. Clear the conversation by refreshing.
- Use the input box below to start a conversation with Copilot
- On the right, you'll see the functions called by the model. Click on a function to reveal the raw response
- On the left,  you can open a settings menu to further modify the models behavior.  I recommend experimenting with different custom instructions.

### Sample prompts
The model has the ability to retrieve content from GitHub. The model will generally try to help you discover and correctly invoke these functions. Nonetheless, here are some interesting examples:`;

const examples = [
  `how do I use this thing?`,
  `summarize the last 3 changes to vercel/ai`,
  `summarize comments on the last 3 pull requests to primer/react`,
  `what does hackernews say about GitHub Copilot?`,
  `what are some good first issues for vercel/swr?`,
  `search for all relevent files on the Dialog component in primer/react, then for the most interesting file, summarize the diff for the files last commmit`,
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
        border: "1px solid",
        borderColor: "border.default",
        backgroundColor: "canvas.default",
        borderRadius: 2,
        width: "fit-content",
        "&:hover": {
          backgroundColor: "canvas.subtle",
          cursor: "pointer",
        },
      }}
      onClick={onClick}
    >
      {children}
    </Box>
  );
}

export default function Intro({ appendMessage }: Props) {
  return (
    <Box
      sx={{
        padding: 3,
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
          border: "1px solid",
          borderColor: "border.default",
          p: 3,
          borderRadius: 2,
          marginRight: "auto",
          marginLeft: "auto",
          width: "768px",
          backgroundColor: "canvas.default",
          boxShadow: "rgba(31, 35, 40, 0.04) 0px 1px 0px",
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
