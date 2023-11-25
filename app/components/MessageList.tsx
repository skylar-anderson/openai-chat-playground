import { Text, Box } from "@primer/react";
import { useState, useRef, useEffect } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@primer/octicons-react";
import { Message } from "ai/react";

import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function UserMessage({ i, message }: { i:number, message: Message }) {
  return (
    <Box mb={1} key={message.id} className="whitespace-pre-wrap">
      <Text color="fg.default" sx={{ fontWeight: "bold" }}>
        {i} {message.content}
      </Text>
    </Box>
  );
}
function BotMessage({ i, message, data }: { i:number, data: any; message: Message }) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <Box mb={3} key={message.id} className="whitespace-pre-wrap">
      <Box color="fg.default">
        <Markdown remarkPlugins={[remarkGfm]}>
          {message.content}
        </Markdown>
      </Box>
      
      {data && data.signature && data.signature !== 'NO_FUNCTION_CALLED' ? (
        <Box
          onClick={() => setIsOpen(!isOpen)}
          as="button"
          color="fg.subtle"
          borderRadius={2}
          sx={{
            alignItems: "center",
            display: "flex",
            gap: "8px",
            fontFamily: "monospace",
            fontSize: 0,
            "&:hover": { color: 'fg.default' },
          }}
        >
          {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
          {data.signature}
        </Box>
      ) : null}
      {isOpen && (
        <Box>
          <code>
            <Box as="pre" fontSize={0}>
              {JSON.stringify(data, null, 2)}  
            </Box>
          </code>
        </Box>
      )}
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
        ? messages.map((m, i) => {
            return m.role === "user" ? (
              <UserMessage i={i} key={i} message={m} />
            ) : (
              <BotMessage i={i} key={i} data={data[(i-1)/2]} message={m} />
            );
          })
        : null}
      <div ref={messagesEndRef} />
    </Box>
  );
}
