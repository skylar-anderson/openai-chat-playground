import { CopilotIcon } from "@primer/octicons-react";
import { Avatar, Spinner, Box, Text } from "@primer/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Message } from "ai";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

type Props = {
  message: Message;
};

function CopilotAvatar() {
  return (
    <Box
      sx={{
        height: "24px",
        width: "24px",
        flexShrink: 0,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        borderRadius: "24px",
        backgroundColor: "bg.sublte",
        border: "1px solid",
        borderColor: "border.default",
        color: "fg.muted",
      }}
    >
      <CopilotIcon size={16} />
    </Box>
  );
}

export default function Message({ message }: Props) {
  const { content, role } = message;
  const title = role === "assistant" ? "Copilot" : "User";
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        maxWidth: "960px",
        width: "100%",
        gap: 3,
      }}
    >
      {role === "assistant" ? (
        <CopilotAvatar />
      ) : (
        <Avatar
          sx={{ flexShrink: 0 }}
          src={"https://avatars.githubusercontent.com/u/90914?v=4"}
          size={24}
        />
      )}
      <Box>
        <Box
          sx={{
            fontWeight: 600,
            color: "fg.default",
            pb: 1,
          }}
        >
          {title}
        </Box>
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
  );
}

/*

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
*/
