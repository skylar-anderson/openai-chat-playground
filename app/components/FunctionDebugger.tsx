import copy from "copy-to-clipboard";
import { useState } from "react";
import { Text, IconButton, Box, UnderlineNav } from "@primer/react";
import {
  CopyIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@primer/octicons-react";
import { FunctionData } from "../types";

export default function FunctionDebugger({
  functionData,
}: {
  functionData: FunctionData;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [tab, setTab] = useState<"schema" | "response" | "request">("response");

  let content: string;
  switch (tab) {
    case "response":
      content = functionData.result;
      break;
    case "request":
      content = functionData.args;
      break;
    case "schema":
      content = functionData.schema;
      break;
  }
  content = JSON.stringify(content, null, 2);

  return (
    <Box
      sx={{
        padding: 0,
        flexShrink: 0,
        overflowY: "scroll",
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
          borderBottom: "1px solid",
          borderColor: "border.default",
          "&:hover": { color: "fg.default" },
        }}
      >
        <Box sx={{ textAlign: "left", flexGrow: "1" }}>
          <Text sx={{ color: "fg.subtle" }}>
            {functionData.strategy === "parallel" ? "⚡️" : "🐌"}·
            {functionData.signature}·
            {functionData.elapsedTime ? `${functionData.elapsedTime}` : ""}
          </Text>
        </Box>
        {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </Box>
      {isOpen && (
        <Box
          sx={{
            backgroundColor: "canvas.subtle",
          }}
        >
          <UnderlineNav
            aria-label={functionData.signature}
            sx={{ paddingLeft: 2, width: "100%", borderBottom: "1px solid" }}
          >
            <UnderlineNav.Item
              onClick={() => setTab("response")}
              aria-current={tab === "response" ? "page" : undefined}
            >
              Response
            </UnderlineNav.Item>
            <UnderlineNav.Item
              onClick={() => setTab("request")}
              aria-current={tab === "request" ? "page" : undefined}
            >
              Request
            </UnderlineNav.Item>
            <UnderlineNav.Item
              onClick={() => setTab("schema")}
              aria-current={tab === "schema" ? "page" : undefined}
            >
              Schema
            </UnderlineNav.Item>
          </UnderlineNav>

          <Box sx={{ p: 3, position: "relative", overflow: "scroll", flex: 1 }}>
            <Box sx={{ position: "absolute", top: 1, right: 1 }}>
              <IconButton
                onClick={() => copy(content)}
                aria-label="Copy response data"
                icon={CopyIcon}
              >
                Copy {tab}
              </IconButton>
            </Box>
            <code>
              <Box
                as="pre"
                fontSize={0}
                p={1}
                m={0}
                sx={{ whiteSpace: "break-spaces" }}
              >
                {content}
              </Box>
            </code>
          </Box>
        </Box>
      )}
    </Box>
  );
}
