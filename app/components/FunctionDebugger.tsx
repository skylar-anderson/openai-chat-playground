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
  const [tab, setTab] = useState<"schema" | "result">("result");
  return (
    <Box
      sx={{
        border: "1px solid",
        borderColor: "border.default",
        borderRadius: 2,
        padding: 0,
        mt: 3,
        overflow: "hidden",
      }}
    >
      <Box
        onClick={() => setIsOpen(!isOpen)}
        as="button"
        borderRadius={2}
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
          "&:hover": { color: "fg.default" },
        }}
      >
        <Box sx={{ textAlign: "left", flexGrow: "1" }}>
          <Text sx={{ color: "fg.subtle" }}>{functionData.signature}</Text>
        </Box>
        {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </Box>
      {isOpen && (
        <Box
          sx={{
            borderTop: "1px solid",
            borderColor: "border.default",
            backgroundColor: "canvas.subtle",
          }}
        >
          <UnderlineNav
            aria-label={functionData.signature}
            sx={{ paddingLeft: 2, width: "100%", borderBottom: "1px solid" }}
          >
            <UnderlineNav.Item
              onClick={() => setTab("result")}
              aria-current={tab === "result" ? "page" : undefined}
            >
              Results
            </UnderlineNav.Item>
            <UnderlineNav.Item
              onClick={() => setTab("schema")}
              aria-current={tab === "schema" ? "page" : undefined}
            >
              Schema
            </UnderlineNav.Item>
          </UnderlineNav>
          <Box p={3}>
            {tab === "result" && (
              <Box sx={{ position: "relative" }}>
                <Box sx={{ position: "absolute", top: "-8px", right: "-8px" }}>
                  <IconButton
                    onClick={() => copy(functionData.result)}
                    aria-label="Copy result"
                    icon={CopyIcon}
                  >
                    Copy result
                  </IconButton>
                </Box>
                <code>
                  <Box as="pre" fontSize={0} p={0} m={0}>
                    {JSON.stringify(functionData.result, null, 2)}
                  </Box>
                </code>
              </Box>
            )}
            {tab === "schema" && (
              <code>
                <Box as="pre" fontSize={0} p={0} m={0}>
                  {JSON.stringify(functionData.schema, null, 2)}
                </Box>
              </code>
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
