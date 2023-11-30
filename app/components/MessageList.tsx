import { Avatar, IconButton, Text, Box } from "@primer/react";
import { useRef, useEffect } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ButtonBaseProps } from "@primer/react/lib/Button/types";
import { MessageWithDebugData } from "../types";
import { ScreenFullIcon, ScreenNormalIcon } from "@primer/octicons-react";
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
type BotMessageProps = {
  message: MessageWithDebugData;
};
function BotMessage({ message, onClick }: BotMessageProps & ButtonBaseProps) {
  const data = message.debugData;
  const content = message.message.content;
  return (
    <Box
      key={message.id}
      sx={{
        color: "fg.default",
        p: 0,
        backgroundColor: "canvas.default",
        mb: 2,
        overflowY: "scroll",
        border: "1px solid rgb(208, 215, 222)",
        width: "100%",
        height: "auto",
        flexShrink: 0,
        borderRadius: 2,
        fontSize: 1,
        lineHeight: 1.5,
        boxShadow: "rgba(31, 35, 40, 0.04) 0px 1px 0px",
      }}
    >
      <Box>
        <Box
          sx={{
            backgroundColor: "canvas.subtle",
            borderBottom: "1px solid",
            borderColor: "border.default",
            px:3,
            py:2,
            fontWeight: 'semibold',
            display: 'flex',
            gap: 2

          }}
        >
          Copilot
        </Box>
        <Box
          color="fg.default"
          p={3}
          sx={{ textAlign: "left", position: "relative" }}
        >
          {/* <IconButton
            icon={ScreenFullIcon}
            aria-label="Expand message"
            variant="invisible"
            size="small"
            onClick={onClick}
            sx={{ position: "absolute", top: "8px", right: "8px" }}
          >
            Expand message
          </IconButton> */}
          {/* <Box sx={{ fontWeight: "semibold", mb: 2 }}>Copilot</Box> */}

          <Markdown remarkPlugins={[remarkGfm]} className="markdownContainer">
            {content}
          </Markdown>
        </Box>
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
      <Box sx={{maxWidth: '9600px'}}>
      {messages.length > 0
        ? messages.map((m, i) => {
            return m.message.role === "user" ? (
              <UserMessage key={i} message={m} />
            ) : (
              <BotMessage
                key={i}
                message={m}
                onClick={() => {
                  if (currentMessage && currentMessage.id === m.id) {
                    onDismiss();
                  } else {
                    onSelectMessage(m);
                  }
                }}
              />
            );
          })
        : null}
      </Box>
      <div ref={messagesEndRef} />
    </Box>
  );
}
