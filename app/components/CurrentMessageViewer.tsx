import { XIcon } from "@primer/octicons-react";
import { Box, IconButton, UnderlineNav } from "@primer/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import FunctionDebugger from "./FunctionDebugger";
import { MessageWithDebugData } from "../types";

type Props = {
  messageWithDebugData: MessageWithDebugData;
  onDismiss: () => void;
};

export default function CurrentMessageViewer({
  onDismiss,
  messageWithDebugData,
}: Props) {
  const { message, debugData } = messageWithDebugData;

  return (
    <Box
      sx={{
        height: "100vh",
        width: "33%",
        display: "flex",
        flexDirection: "column",
        py: 3,
        flexGrow: "1",
      }}
    >
      <Box
        sx={{
          height: "100%",
          border: "1px solid",
          borderColor: "border.default",
          borderRadius: 2,
          fontSize: 1,
          color: "fg.default",
          position: "relative",
          p: 3,
          overflowY: "scroll",
        }}
      >
        <Box sx={{ position: "absolute", top: "8px", right: "8px" }}>
          <IconButton
            onClick={onDismiss}
            aria-label="close message pane"
            variant="invisible"
            size="small"
            icon={XIcon}
          >
            Close message preview
          </IconButton>
        </Box>

        <Markdown remarkPlugins={[remarkGfm]}>{message.content}</Markdown>
        {debugData.showFunctionDebugger && (
          <FunctionDebugger functionData={debugData} />
        )}
      </Box>
    </Box>
  );
}
