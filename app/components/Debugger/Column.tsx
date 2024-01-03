import FunctionDebugger from "./Function";
import MessageDebugger from "./Message";
import CompletionDebugger from "./Completion";
import { Box } from "@primer/react";
import { CompletionData, FunctionData, MessageData } from "../../types";

type DebugColumnType = {
  data?: (FunctionData | MessageData | CompletionData)[];
  imageAttached: boolean;
};

export default function DebugColumn({ data, imageAttached }: DebugColumnType) {
  return (
    <Box
      sx={{
        height: "100%",
        flexShrink: 0,
        display: "flex",
        borderLeft: "1px solid",
        borderColor: "border.default",
        width: "640px",
        p: 0,
        overflowY: "scroll",
        flexDirection: "column",
      }}
    >
      {imageAttached ? (
        <Box p={4} sx={{ fontSize: 1, textAlign: "center" }}>
          <Box sx={{ mb: 1, color: "fg.default", fontWeight: "bold" }}>
            Function calling disabled!
          </Box>
          <Box sx={{ fontSize: 0, color: "fg.muted" }}>
            Vision utilizes <code>gpt-4-vision-preview</code> which does not
            support function calling. You can enable function calling by first
            submitting your message with the iamge, and then removing the
            attached image from the message input.
          </Box>
        </Box>
      ) : (
        <>
          {data && data.length ? (
            data.map((d, i) => {
              if (d.debugType === "function") {
                return <FunctionDebugger key={i} functionData={d} />;
              } else if (d.debugType === "message") {
                return <MessageDebugger key={i} messageData={d} />;
              } else if (d.debugType === "completion") {
                return <CompletionDebugger key={i} completionData={d} />;
              }
            })
          ) : (
            <Box p={4} sx={{ fontSize: 1, textAlign: "center" }}>
              <Box sx={{ mb: 1, color: "fg.default", fontWeight: "bold" }}>
                Functions, tools, and prompts will appear here.
              </Box>
              <Box sx={{ fontSize: 0, color: "fg.muted" }}>
                Open settings to change function calling strategy. Tools are run
                in parallel whereas functions run sequentially.
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
