import copy from "copy-to-clipboard";
import { useState } from "react";
import { Text } from "@primer/react";
import { FunctionData } from "../../types";
import { CodeBox, DebugItem, DebugSubItem } from "./Items";

export default function FunctionDebugger({
  functionData,
}: {
  functionData: FunctionData;
}) {
  const title = (
    <Text sx={{ color: "fg.subtle" }}>
      <Text sx={{ color: "fg.default" }}>
        {functionData.strategy === "parallel" ? "Tool:" : "Function:"}
      </Text>{" "}
      {functionData.signature}·
      {functionData.elapsedTime ? `${functionData.elapsedTime}` : ""}
    </Text>
  );

  return (
    <DebugItem title={title}>
      <>
        <DebugSubItem title={<Text sx={{ color: "fg.subtle" }}>request</Text>}>
          <CodeBox>{JSON.stringify(functionData.args, null, 2)}</CodeBox>
        </DebugSubItem>
        <DebugSubItem title={<Text sx={{ color: "fg.subtle" }}>response</Text>}>
          <CodeBox>{JSON.stringify(functionData.result, null, 2)}</CodeBox>
        </DebugSubItem>
        <DebugSubItem title={<Text sx={{ color: "fg.subtle" }}>schema</Text>}>
          <CodeBox>{JSON.stringify(functionData.schema, null, 2)}</CodeBox>
        </DebugSubItem>
      </>
    </DebugItem>
  );
}
