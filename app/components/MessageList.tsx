import { Text, Box } from "@primer/react";
import { useRef, useEffect } from "react";
import { Message } from "ai/react";

function UserMessage({ message }: { message: Message }) {
  return (
    <Box mb={1} key={message.id} className="whitespace-pre-wrap">
      <Text color="fg.default" sx={{ fontWeight: "bold" }}>
        {message.content}
      </Text>
    </Box>
  );
}
function BotMessage({ message }: { message: Message }) {
  return (
    <Box mb={3} key={message.id} className="whitespace-pre-wrap">
      <Box color="fg.subtle">{message.content}</Box>
    </Box>
  );
}

export default function MessageList({ messages }: { messages: Message[] }) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);
  return (
    <Box
      padding={4}
      width="100%"
      fontSize={1}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        marginRight: "auto",
        marginLeft: "auto",
        flexGrow: 1,
        overflowY: "scroll",
      }}
    >
      {messages.length > 0
        ? messages.map((m) => {
            return m.role === "user" ? (
              <UserMessage message={m} />
            ) : (
              <BotMessage message={m} />
            );
          })
        : null}
      <div ref={messagesEndRef} />
    </Box>
  );
}
