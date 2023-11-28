import { Spinner, Text, Box } from "@primer/react";
import { useRef, useEffect } from "react";
import { Message } from "ai/react";
import BotMessage from "./BotMessage";

function UserMessage({ message }: { message: Message }) {
  return (
    <Box mb={1} key={message.id} className="whitespace-pre-wrap">
      <Text color="fg.default" sx={{ fontSize: 3 }}>
        {message.content}
      </Text>
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

  for (let i = 0; i < messages.length; i += 2) {
    const turn = {
      index: i,
      user: messages[i],
      debugData: i > 0 ? data[i / 2] : null,
      agent: messages[i + 1] ? messages[i + 1] : null,
    };
    turns.push(turn);
  }

  useEffect(scrollToBottom, [messages]);

  return (
    <Box
      padding={1}
      width="100%"
      fontSize={1}
      sx={{
        backgroundColor: "canvas.subtle",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        marginRight: "auto",
        marginLeft: "auto",
        flexGrow: 1,
        overflowY: "scroll",
        paddingBottom: 0,
        gap: 1,
      }}
    >
      {turns.length > 0
        ? turns.map((turn, i) => (
            <Box
              sx={{
                backgroundColor: "canvas.default",
                //border: '1px solid',
                borderRadius: 2,
                padding: 3,
                //borderColor: 'border.default',
                boxShadow: "0 1px 2px rgba(0, 0, 0, 0.06)",
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
                <Spinner size='small' />
              )}
            </Box>
          ))
        : null}
      <div ref={messagesEndRef} />
    </Box>
  );
}
