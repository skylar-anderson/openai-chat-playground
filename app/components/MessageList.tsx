import { Text, Box } from "@primer/react";
import { useRef, useEffect } from "react";
import CopilotMessage from "./CopilotMessage";
import { type Message } from "ai";
function UserMessage({ message }: { message: Message }) {
  return (
    <Box
      sx={{
        mb: 2,
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end",
      }}
    >
      <Box
        p={3}
        sx={{
          borderRadius: 2,
          lineHeight: 1,
          backgroundColor: "canvas.subtle",
        }}
      >
        <Text color="fg.default" sx={{ lineHeight: "21px", fontSize: 1 }}>
          {message.content}
        </Text>
      </Box>
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
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        marginRight: "auto",
        marginLeft: "auto",
        flexGrow: 1,
        overflowY: "scroll",
        paddingBottom: 2,
        paddingX: 4,
        paddingTop: 4,
        width: "100%",
        fontSize: 1,
      }}
    >
      <Box sx={{ maxWidth: "9600px" }}>
        {messages.length > 0
          ? messages.map((m, i) => {
              return m.role === "user" ? (
                <UserMessage key={i} message={m} />
              ) : (
                <CopilotMessage key={i} message={m} />
              );
            })
          : null}
      </Box>
      <div ref={messagesEndRef} />
    </Box>
  );
}
