import { Text, Box } from "@primer/react";
import { useRef, useEffect } from "react";
import { MessageWithDebugData } from "../types";
import CopilotMessage from "./CopilotMessage";
function UserMessage({ message }: { message: MessageWithDebugData }) {
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
        <Text color="fg.default" sx={{ fontSize: 1 }}>
          {message.message.content}
        </Text>
      </Box>
    </Box>
  );
}

export default function MessageList({
  messages,
  onSelectMessage,
  currentMessage,
  onDismiss,
}: {
  messages: MessageWithDebugData[];
  onDismiss: () => void;
  currentMessage: MessageWithDebugData | null;
  onSelectMessage: (message: MessageWithDebugData | null) => void;
}) {
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
        paddingBottom: 0,
        width: "100%",
        fontSize: 1,
      }}
    >
      <Box sx={{ maxWidth: "9600px" }}>
        {messages.length > 0
          ? messages.map((m, i) => {
              return m.message.role === "user" ? (
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
