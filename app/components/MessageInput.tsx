import { useRef } from "react";
import { IconButton, Box, TextInput } from "@primer/react";
import {
  StopIcon,
  PaperAirplaneIcon,
  PaperclipIcon,
} from "@primer/octicons-react";

type Props = {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  input: string;
  onStop: () => void;
};

function FileUpload({ onFileChange }: { onFileChange: Props["onFileChange"] }) {
  const hiddenFileInput = useRef<HTMLInputElement | null>(null);
  const handleButtonClick = () => {
    hiddenFileInput.current?.click();
  };

  return (
    <>
      <input
        type="file"
        name="avatar"
        accept="image/*"
        style={{ display: "none" }}
        ref={hiddenFileInput}
        onChange={onFileChange}
      />

      <IconButton
        icon={PaperclipIcon}
        aria-label="Default"
        size="large"
        onClick={handleButtonClick}
        sx={{ flexShrink: 0 }}
      >
        Add attachment
      </IconButton>
    </>
  );
}

export default function MessageInput({
  input,
  onInputChange,
  onSubmit,
  isLoading,
  onStop,
  onFileChange,
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
      <FileUpload onFileChange={onFileChange} />

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
