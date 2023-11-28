import { Spinner, Text, Box } from "@primer/react";
import { useRef, useEffect } from "react";
import { Message } from "ai/react";
import FunctionDebugger from "./FunctionDebugger";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

function UserMessage({ message }: { message: Message }) {
  return (
    <Box px={3} py={3} sx={{ borderRadius: '6px 6px 0 0', borderBottom: '1px solid', borderColor: 'border.default', backgroundColor: 'canvas.subtle'}} key={message.id}>
      <Text color="fg.default" sx={{ fontSize: 1, fontWeight: 'semibold' }}>
        {message.content}
      </Text>
    </Box>
  );
}
type BotMessageProps = {
  data: any;
  message: Message;
};
function BotMessage({ message, data }: BotMessageProps) {
  return (
    <Box key={message.id} sx={{overflowY: 'scroll'}}>
      <Box p={3} color="fg.default" className="markdownContainer">
        <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
      </Box>

      {data && data.signature && data.signature !== "NO_FUNCTION_CALLED" ? (
        <FunctionDebugger functionData={data} />
      ) : null}
    </Box>
  );
}

export default function MessageList({
  data,
  messages,
}: {
  data: any | undefined;
  messages: Message[];
}) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const turns = [];
  console.log(data);
  for (let i = 0; i < messages.length; i += 2) {
    const dataIndex = i === 0 ? i : (i / 2);
    const turn = {
      index: i,
      user: messages[i],
      debugData: (data && data[dataIndex]) ? data[dataIndex] : null,
      agent: messages[i + 1] ? messages[i + 1] : null,
    };
    turns.push(turn);
  }

  useEffect(scrollToBottom, [messages]);

  return (
    <Box
      sx={{
        //backgroundColor: "canvas.subtle",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        marginRight: "auto",
        marginLeft: "auto",
        flexGrow: 1,
        overflowY: "scroll",
        paddingBottom: 0,
        padding: 3,
        width: "100%",
        fontSize: 1,
        gap: 3,
      }}
    >
      {turns.length > 0
        ? turns.map((turn, i) => (
            <Box
              sx={{
                backgroundColor: "canvas.default",
                border: '1px solid',
                borderRadius: 2,
                //padding: 3,
                borderColor: 'border.default',
                //boxShadow: "0 0px 4px rgba(0, 0, 0, 0.03), 0 1px 1px rgba(0, 0, 0, 0.2), 0 1px 5px rgba(0, 0, 0, 0.02)"
              }}
            >
              <UserMessage key={turn.index} message={turn.user} />
              {turn.agent ? (
                <BotMessage
                  key={turn.index + 1}
                  data={turn.debugData}
                  message={turn.agent}
                />
              ) : (
                <Box p={3}>
                  <Spinner size='small' />
                </Box>
              )}
            </Box>
          ))
        : null}
      <div ref={messagesEndRef} />
    </Box>
  );
}
