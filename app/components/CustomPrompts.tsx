import { Box, ActionMenu, ActionList } from "@primer/react";
import { prompts } from "../custom-prompts";

type Props = {
  appendMessage: (s: string) => void;
};
export default function CustomPrompts({ appendMessage }: Props) {
  return (
    <Box>
      <ActionList>
        <ActionList.Group title="Prompt recipes">
          {prompts.map((p, i) => (
            <ActionList.Item
              key={i}
              sx={{ cursor: "pointer" }}
              as="button"
              onSelect={() => appendMessage(p.prompt)}
            >
              {p.title}
            </ActionList.Item>
          ))}
        </ActionList.Group>
      </ActionList>
    </Box>
  );
}
