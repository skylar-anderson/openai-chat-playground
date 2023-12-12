import { IconButton, Box, TextInput } from "@primer/react";
import { PaperAirplaneIcon } from "@primer/octicons-react";

type Props = {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  input: string;
};

export default function MessageInput({
  input,
  onInputChange,
  onSubmit,
  isLoading,
}: Props) {
  return (
    <Box
      as="form"
      onSubmit={onSubmit}
      sx={{
        display: "flex",
        gap: 2,
      }}
    >
      <TextInput
        sx={{ paddingRight: 1 }}
        trailingAction={
          <IconButton
            icon={PaperAirplaneIcon}
            aria-label="Default"
            type="submit"
            variant="invisible"
            disabled={isLoading}
            sx={{ marginTop: "-7px" }}
          >
            Submit
          </IconButton>
        }
        contrast={true}
        value={input}
        block={true}
        placeholder={isLoading ? "Loading..." : "Ask Copilot..."}
        size="large"
        autoFocus={true}
        loading={isLoading}
        onChange={onInputChange}
      />
    </Box>
  );
}
