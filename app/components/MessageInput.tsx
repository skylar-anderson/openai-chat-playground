import { IconButton, Box, TextInput } from "@primer/react";
import { StopIcon, PaperAirplaneIcon } from "@primer/octicons-react";

type Props = {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  input: string;
  onStop: () => void;
};

export default function MessageInput({
  input,
  onInputChange,
  onSubmit,
  isLoading,
  onStop,
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
          isLoading ? (
            <IconButton
              icon={StopIcon}
              aria-label="Default"
              variant="invisible"
              onClick={onStop}
              sx={{ marginTop: "-7px" }}
            >
              Stop generating
            </IconButton>
          ) : (
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
          )
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
