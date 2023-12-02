import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Spinner, Box, IconButton, Text } from "@primer/react";
import { CheckIcon } from "@primer/octicons-react";
import { MessageWithDebugData } from "../types";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

type Props = {
  message: MessageWithDebugData;
};

function extractThreadIds(urls: string): number[] {
  if (!urls) return [];
  urls = urls.trim();
  urls = urls.replace(/\n+/g, "\n");
  const lines = urls.split("\n");
  return lines
    .map((line) => {
      const parts = line.split("/");
      const threadId = parts[parts.length - 1];
      return Number(threadId);
    })
    .filter((id) => !isNaN(id));
}

function NotificationsList({ children }) {
  const threadIds = extractThreadIds(children);
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "border.default",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          //backgroundColor: 'canvas.subtle',
          //borderBottom: '1px solid',
          //borderColor: 'border.default',
          fontFamily: "sans-serif",
          fontWeight: "bold",
        }}
      >
        Notifications
      </Box>
      <Box>
        {threadIds.map((tid) => (
          <UnfurledThread key={`thread-${tid}`} threadId={tid} />
        ))}
      </Box>
    </Box>
  );
}
type Thread = {
  subject: {
    title: string
  };
  repository: {
    full_name: string;
    private:boolean;
  };
  unread: boolean;

}
function UnfurledThread({ threadId }: { threadId: number }) {
  const [thread, setThread] = useState<Thread|null>(null);

  useEffect(() => {
    fetch(`/api/threads/${threadId}`)
      .then((response) => response.json())
      .then((data) => setThread(data.data))
      .catch((error) => console.error("Error:", error));
  }, [threadId]);

  if (!thread) {
    return (
      <Box>
        <Spinner size="small" />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 3,
        flexDirection: "row",
        fontFamily: "sans-serif",
        px: 3,
        py: 2,
        borderBottom: "1px solid",
        borderColor: "border.default",
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Box sx={{ fontSize: 1, color: "fg.default", mb: 0 }}>
          {thread.subject.title}
        </Box>
        <Box
          sx={{
            fontSize: 0,
            display: "flex",
            gap: 1,
            flexDirection: "row",
            color: "fg.subtle",
          }}
        >
          <Text>{thread.repository.full_name}</Text>
          <Text>·</Text>
          <Text>{thread.repository.private ? "Private" : "Public"}</Text>
        </Box>
      </Box>
      <Box>{thread.unread ? "Unread" : "Read"}</Box>
      <Box>
        <IconButton aria-label="Mark as done" icon={CheckIcon}>
          Mark as done
        </IconButton>
      </Box>
    </Box>
  );
}

export default function CopilotMessage({ message }: Props) {
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
            px: 3,
            py: 2,
            fontWeight: "semibold",
            fontFamily: "sans-serif",
            display: "flex",
            gap: 2,
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

          <Markdown
            remarkPlugins={[remarkGfm]}
            className="markdownContainer"
            components={{
              code(props) {
                const { children, className, node, ...rest } = props;
                const match = /language-(\w+)/.exec(className || "");
                if (!match) {
                  return (
                    <code {...rest} className={className}>
                      {children}
                    </code>
                  );
                }
                switch (match[1]) {
                  case "notificationsList":
                    return <NotificationsList children={children} />;
                  default:
                    return (
                      <SyntaxHighlighter
                        {...rest}
                        PreTag="div"
                        children={String(children).replace(/\n$/, "")}
                        language={match[1]}
                      />
                    );
                }
              },
            }}
          >
            {content}
          </Markdown>
        </Box>
      </Box>
    </Box>
  );
}
