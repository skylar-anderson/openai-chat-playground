import { Box, Text } from "@primer/react";
import { MessageData } from "@/app/types";
import { ChatCompletionMessageParam } from "openai/resources/chat";
import { DebugItem, DebugSubItem, CodeBox } from "./Items";

function MessageItem({ message }: { message: ChatCompletionMessageParam }) {
  if (!message.content) return null;

  let content;
  switch (message.role) {
    case "tool":
      content = (
        <CodeBox>
          {JSON.stringify(JSON.parse(message.content), null, 2)}
        </CodeBox>
      );
      break;
    case "assistant":
      content = (
        <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <CodeBox>
            <>Message {message.content}</>
          </CodeBox>
          <CodeBox>
            Function call{JSON.stringify(message.function_call, null, 2)}
          </CodeBox>
          <CodeBox>
            Tool calls{JSON.stringify(message.tool_calls, null, 2)}
          </CodeBox>
        </Box>
      );
      break;
    default:
      content = (
        <CodeBox>
          <>{message.content}</>
        </CodeBox>
      );
  }

  return <DebugSubItem title={<>{message.role}</>}>{content}</DebugSubItem>;
}

export default function MessageDebugger({
  messageData,
}: {
  messageData: MessageData;
}) {
  const count =
    messageData.messages.length === 1
      ? "1 message"
      : `${messageData.messages.length} messages`;
  const title = (
    <Text sx={{ color: "fg.subtle" }}>
      <Text sx={{ color: "fg.default" }}>Prompt: </Text>
      {count}
    </Text>
  );

  return (
    <DebugItem title={<>{title}</>}>
      {messageData.messages.map((message, i) => (
        <MessageItem key={i} message={message} />
      ))}
    </DebugItem>
  );
}
