import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Box } from "@primer/react";
import { Message } from "ai/react";
import FunctionDebugger from "./FunctionDebugger";
type Props = {
  data: any;
  message: Message;
};

export default function BotMessage({ message, data }: Props) {
  return (
    <Box key={message.id} className="whitespace-pre-wrap">
      <Box color="fg.default" className="markdownContainer">
        <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
      </Box>

      {data && data.signature && data.signature !== "NO_FUNCTION_CALLED" ? (
        <FunctionDebugger functionData={data} />
      ) : null}
    </Box>
  );
}
