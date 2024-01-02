import { useState } from "react";
import { Box, Text } from "@primer/react";
import { ChevronDownIcon, ChevronUpIcon } from "@primer/octicons-react";
import { MessageData } from "@/app/types";
import { ChatCompletionMessageParam } from "openai/resources/chat";

function MessageItem({ message }: { message: ChatCompletionMessageParam }) {
  //const content = JSON.stringify(message, null, 2);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const content = message.content;
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "scroll",
        flex: 1,
        borderLeft: "1px dotted",
        borderColor: "border.default",
        marginLeft: "20px",
      }}
      px={3}
    >
      <Box
        onClick={() => setIsOpen(!isOpen)}
        as="button"
        py={2}
        sx={{
          // paddingLeft: "32px",
          // paddingRight: "12px",
          alignItems: "center",
          background: "none",
          border: "none",
          display: "flex",
          width: "100%",
          gap: "8px",
          fontFamily: "monospace",
          cursor: "pointer",
          fontSize: 0,
          flexShrink: 0,
          "&:hover": { color: "fg.default" },
        }}
      >
        {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        <Box sx={{ textAlign: "left", flexGrow: "1" }}>
          <Text sx={{ color: "fg.subtle" }}>{message.role} message</Text>
        </Box>
      </Box>
      {isOpen ? (
        <code>
          <Box
            as="pre"
            fontSize={0}
            p={3}
            m={0}
            mb={2}
            sx={{
              whiteSpace: "break-spaces",
              backgroundColor: "canvas.subtle",
              borderRadius: 2,
            }}
          >
            {message.role === "tool"
              ? JSON.stringify(JSON.parse(content as string), null, 2)
              : content}
            {message.role === "assistant" ? (
              <Box>
                {JSON.stringify(message.function_call, null, 2)}
                {JSON.stringify(message.tool_calls, null, 2)}
              </Box>
            ) : null}
          </Box>
        </code>
      ) : null}
    </Box>
  );
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
  const title = `${count} sent to model`;
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Box
      sx={{
        padding: 0,
        flexShrink: 0,
        overflowY: "scroll",
        borderBottom: "1px solid",
        borderColor: "border.default",
      }}
    >
      <Box
        onClick={() => setIsOpen(!isOpen)}
        as="button"
        py={2}
        sx={{
          paddingLeft: "12px",
          paddingRight: "12px",
          alignItems: "center",
          background: "none",
          border: "none",
          display: "flex",
          width: "100%",
          gap: "8px",
          fontFamily: "monospace",
          cursor: "pointer",
          fontSize: 0,
          flexShrink: 0,
          "&:hover": { color: "fg.default" },
        }}
      >
        {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
        <Box sx={{ textAlign: "left", flexGrow: "1" }}>
          <Text sx={{ color: "fg.subtle" }}>{title}</Text>
        </Box>
      </Box>
      {isOpen && (
        <Box sx={{}}>
          {messageData.messages.map((message, i) => (
            <MessageItem key={i} message={message} />
          ))}
        </Box>
      )}
    </Box>
  );
}
