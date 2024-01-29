import { useRef } from "react";
import { IconButton, Box, TextInput, Textarea } from "@primer/react";
import {
  StopIcon,
  PaperAirplaneIcon,
  PaperclipIcon,
  XIcon,
} from "@primer/octicons-react";

type Props = {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  input: string;
  onStop: () => void;
  base64File: string | null;
  clearFile: () => void;
  fileInputKey: string;
};

function FileUpload({
  onFileChange,
  fileInputKey,
}: {
  fileInputKey: string;
  onFileChange: Props["onFileChange"];
}) {
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
        key={fileInputKey}
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
  base64File,
  clearFile,
  fileInputKey,
}: Props) {
  return (
    <Box sx={{ flexDirection: "column" }}>
      {base64File && (
        <Box
          sx={{
            position: "relative",
            flex: 0,
            width: "fit-content",
            mb: 2,
            color: "fg.danger",
          }}
        >
          <Box
            as="img"
            sx={{
              borderRadius: 2,
              height: "120px",
              border: "1px solid",
              borderColor: "border.default",
              boxShadow: "rgba(31, 35, 40, 0.04) 0px 1px 3px",
            }}
            src={base64File}
            alt="Uploaded image"
          />

          <IconButton
            aria-label="Default"
            icon={XIcon}
            onClick={clearFile}
            variant="danger"
            size="small"
            sx={{
              position: "absolute",
              top: "-8px",
              right: "-8px",
              borderRadius: "100px",
              background: "fg.default",
            }}
          >
            Remove
          </IconButton>
        </Box>
      )}
      <Box
        as="form"
        onSubmit={onSubmit}
        sx={{
          display: "flex",
          gap: 2,
        }}
      >
        <FileUpload fileInputKey={fileInputKey} onFileChange={onFileChange} />

        <Textarea
          sx={{ paddingRight: 1 }}
          contrast={true}
          value={input}
          block={true}
          placeholder={isLoading ? "Loading..." : "Ask Copilot..."}
          size="large"
          autoFocus={true}
          onChange={onInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Esc') {
              e.preventDefault();
              if (!isLoading) onStop();
            } else if (e.key === 'Enter' && (e.ctrlKey | e.shiftKey)) {
              e.preventDefault();
              const value = e.target.value;
              const start = e.target.selectionStart;
              const end = e.target.selectionEnd;
              e.target.value = value.slice(0, start) + '\n' + value.slice(end);
              e.target.selectionStart = e.target.selectionEnd = start + 1;
            } else if (e.key === 'Enter') {
              e.preventDefault();
              if (!isLoading) onSubmit(e);
            }
          }}
        />
      </Box>
    </Box>
  );
}
