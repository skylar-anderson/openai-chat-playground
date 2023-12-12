import { Spinner, Box, IconButton, Text } from "@primer/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "ai";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

type Props = {
  message: Message;
};

export default function CopilotMessage({ message }: Props) {
  const { content } = message;
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
          sx={{ textAlign: "left", fontSize: 2, lineHeight: 1.5 }}
        >
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
                  default:
                    return (
                      <SyntaxHighlighter
                        {...(rest as any)}
                        PreTag="div"
                        $props={{}}
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
