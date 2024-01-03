import { CompletionData } from "@/app/types";
import { DebugItem, CodeBox } from "./Items";

export default function CompletionDebugger({
  completionData,
}: {
  completionData: CompletionData;
}) {
  const { completion } = completionData;
  let content = completion;
  try {
    // sometime completion is a string, sometime it's an object
    // guess we'll find out soon enough!
    content = JSON.parse(completion);

    if (content.function_call?.arguments) {
      content.function_call.arguments = JSON.parse(
        content.function_call.arguments,
      );
    }

    if (content.tool_calls) {
      content.tool_calls = content.tool_calls.map((tc: any) => {
        return {
          ...tc,
          function: {
            ...tc.function,
            arguments: JSON.parse(tc.function.arguments),
          },
        };
      });
    }

    content = JSON.stringify(content, null, 2);
  } catch (e) {
    // do nothing...i guess it was just a string all along :(
    console.log(e);
  }
  return (
    <DebugItem title={<>Completion</>}>
      <CodeBox>
        <>{content}</>
      </CodeBox>
    </DebugItem>
  );
}
