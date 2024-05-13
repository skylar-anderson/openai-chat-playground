import { useRef, useState } from "react";
import { Spinner, IconButton, Box, Textarea } from "@primer/react";
import {
  StopIcon,
  PaperAirplaneIcon,
  PaperclipIcon,
  XIcon,
} from "@primer/octicons-react";

type Props = {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
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
  const formRef = useRef<HTMLFormElement | null>(null);

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
        ref={formRef}
        onSubmit={onSubmit}
        sx={{
          display: "flex",
          position: "relative",
          gap: 2,
        }}
      >
        <FileUpload fileInputKey={fileInputKey} onFileChange={onFileChange} />

        <Textarea
          contrast={true}
          value={input}
          block={true}
          placeholder={isLoading ? "Loading..." : "Ask Copilot..."}
          autoFocus={true}
          onChange={onInputChange}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              e.preventDefault();
              if (isLoading) onStop();
            } else if (e.key === "Enter" && (e.ctrlKey || e.shiftKey)) {
              e.preventDefault();
              const target = e.target as HTMLTextAreaElement;
              const value = target.value;
              const start = target.selectionStart;
              const end = target.selectionEnd;
              target.value = value.slice(0, start) + "\n" + value.slice(end);
              target.selectionStart = target.selectionEnd = start + 1;
            } else if (e.key === "Enter") {
              e.preventDefault();
              if (!isLoading) formRef.current?.requestSubmit();
            }
          }}
        />

        {isLoading ? (
          <>
            <Spinner
              size="small"
              sx={{ position: "absolute", right: "64px", top: "12px" }}
            />
            <IconButton
              icon={StopIcon}
              aria-label="Default"
              size="large"
              onClick={onStop}
              sx={{ flexShrink: 0 }}
            >
              Stop generating
            </IconButton>
          </>
        ) : (
          <IconButton
            icon={PaperAirplaneIcon}
            aria-label="Default"
            size="large"
            type="submit"
            disabled={isLoading}
            sx={{ flexShrink: 0 }}
          >
            Submit
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
