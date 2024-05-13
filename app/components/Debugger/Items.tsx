import { useState } from "react";
import { TriangleDownIcon, TriangleRightIcon } from "@primer/octicons-react";
import { Octicon, Box } from "@primer/react";

const itemStyles = {
  background: "none",
  border: "none",
  display: "flex",
  width: "100%",
  gap: "8px",
  fontFamily: "monospace",
  cursor: "pointer",
  fontSize: 0,
  flexShrink: 0,
};

export function DebugItem({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <Box
      py={2}
      sx={{
        flexShrink: 0,
        overflowY: "scroll",
        borderBottom: "1px solid",
        borderColor: "border.default",
      }}
    >
      <Box
        onClick={() => setIsOpen(!isOpen)}
        as="button"
        sx={{
          paddingLeft: "12px",
          paddingRight: "12px",
          ...itemStyles,
        }}
      >
        {isOpen ? <Octicon icon={TriangleDownIcon} /> : <Octicon icon={TriangleRightIcon} />}

        <Box sx={{ textAlign: "left", flexGrow: "1", lineHeight: "16px" }}>
          {title}
        </Box>
      </Box>

      {isOpen ? <Box pt={2}>{children}</Box> : null}
    </Box>
  );
}

export function DebugSubItem({
  title,
  children,
}: {
  title: React.ReactNode;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  return (
    <Box
      py={1}
      sx={{
        position: "relative",
        overflow: "scroll",
        flex: 1,
        borderLeft: "1px dotted",
        borderColor: "border.default",
        marginLeft: "20px",
      }}
      px={2}
    >
      <Box onClick={() => setIsOpen(!isOpen)} as="button" sx={itemStyles}>
        {isOpen ? <Octicon icon={TriangleDownIcon} /> : <Octicon icon={TriangleRightIcon} />}
        <Box sx={{ textAlign: "left", flexGrow: "1" }}>{title}</Box>
      </Box>
      {isOpen ? children : null}
    </Box>
  );
}

export function CodeBox({ children }: { children: React.ReactNode }) {
  return (
    <code>
      <Box
        as="pre"
        fontSize={0}
        p={3}
        m={0}
        mb={2}
        sx={{
          marginLeft: "14px",
          whiteSpace: "break-spaces",
          borderLeft: "1px dotted",
          borderColor: "border.default",
          backgroundColor: "canvas.subtle",
        }}
      >
        {children}
      </Box>
    </code>
  );
}
