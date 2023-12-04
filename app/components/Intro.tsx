import { Box } from "@primer/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const source = `### How to use this prototype:

- Messages are stored in your browser. Clear the conversation by restarting.
- Use the input box below to start a conversation with Copilot
- On the right, you'll see the functions called by the model. Click on a function to reveal the raw response
- On the left,  you can open a settings menu to further modify the models behavior.  I recommend experimenting with different custom instructions.

### Sample prompts
The model has the ability to retrieve content from GitHub. The model will generally try to help you discover and correctly invoke these functions. Nonetheless, here are some interesting examples:

- \`how do I use this thing?\`
- \`summarize the last 3 changes to vercel/ai\`
- \`summarize comments on the last 3 pull requests to primer/react\`
- \`what does hackernews say about GitHub Copilot?\`
- \`what are some good first issues for vercel/swr?\`
- \`search for all relevent files on the Dialog component in primer/react, then for the most interesting file, look at the last 3 commits and summarize their diffs\`
  `;

export default function Intro() {
  return (
    <Box
      sx={{
        padding: 5,
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        marginRight: "auto",
        marginLeft: "auto",
        flexGrow: 1,
        overflowY: "scroll",
        paddingBottom: 0,
        width: "100%",
        fontSize: 1,
      }}
    >
      <Markdown remarkPlugins={[remarkGfm]} className="markdownContainer">
        {source}
      </Markdown>
    </Box>
  );
}
