"use client";
import Image from "next/image";
import {
  Box,
  BaseStyles,
  IconButton,
  ThemeProvider,
  Button,
} from "@primer/react";
import { useChat } from "ai/react";
import { useState } from "react";
import MessageList from "./components/MessageList";
import SettingsForm from "./components/SettingsForm";
import { FUNCTION_CALLING_MODELS } from "./models";
import { availableFunctions, FunctionName } from "./api/chat/functions";
import useLocalStorage from "./hooks/useLocalStorage";
import { SettingsProps, FunctionData } from "./types";
import MessageInput from "./components/MessageInput";
import FunctionDebugger from "./components/FunctionDebugger";
import Intro from "./components/Intro";
import TitleBar, { Visibility } from "./components/TitleBar";

const defaultInstructions = ``;

const tools = Object.keys(availableFunctions) as FunctionName[];

function DebugColumn({
  data,
  imageAttached,
}: {
  data?: FunctionData[];
  imageAttached: boolean;
}) {
  return (
    <Box
      sx={{
        height: "100%",
        flexShrink: 0,
        display: "flex",
        borderLeft: "1px solid",
        borderColor: "border.default",
        width: "480px",
        p: 0,
        overflowY: "scroll",
        flexDirection: "column",
      }}
    >
      {imageAttached ? (
        <Box p={4} sx={{ fontSize: 1, textAlign: "center" }}>
          <Box sx={{ mb: 1, color: "fg.default", fontWeight: "bold" }}>
            Function calling disabled!
          </Box>
          <Box sx={{ fontSize: 0, color: "fg.muted" }}>
            Vision utilizes <code>gpt-4-vision-preview</code> which does not
            support function calling. You can enable function calling by first
            submitting your message with the iamge, and then removing the
            attached image from the message input.
          </Box>
        </Box>
      ) : (
        <>
          {data &&
            data.map((d, i) => <FunctionDebugger key={i} functionData={d} />)}
          {!data?.length && (
            <Box p={4} sx={{ fontSize: 1, textAlign: "center" }}>
              <Box sx={{ mb: 1, color: "fg.default", fontWeight: "bold" }}>
                Function calls will appear here as they occur.
              </Box>
              <Box sx={{ fontSize: 0, color: "fg.muted" }}>
                Functions marked with ⚡️ were run in parallel. Functions marked
                with 🐌 were run sequentially. Open settings to change function
                calling strategy.
              </Box>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

const toBase64 = (file: File) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);

    fileReader.onload = () => {
      resolve(fileReader.result);
    };

    fileReader.onerror = (error) => {
      reject(error);
    };
  });
};

export default function Chat() {
  const [settingsVisibility, setSettingsVisibility] =
    useState<Visibility>("hidden");
  const [file, setFile] = useState<File | null>(null);
  const [base64File, setBase64File] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState<string>("a");

  const {
    data,
    isLoading,
    messages,
    input,
    handleInputChange,
    handleSubmit,
    append,
    setMessages,
    stop,
  } = useChat();

  const debugData = data as unknown as FunctionData[];

  const [settings, setSettings] = useLocalStorage<SettingsProps>("settings", {
    customInstructions: defaultInstructions,
    tools: tools,
    model: FUNCTION_CALLING_MODELS[0],
    parallelize: true,
  });

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) {
      return;
    }
    const file = e.target.files[0] as File;
    const base64 = await toBase64(file);
    setFile(file);
    setBase64File(base64 as string);
  }

  function onSettingsChange(settings: SettingsProps) {
    setSettings(settings);
    setSettingsVisibility("hidden");
  }

  function clearFile() {
    setFile(null);
    setBase64File(null);
    setFileInputKey(fileInputKey === "a" ? "b" : "a"); // hack to reset file input
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (isLoading) return false;

    console.log(base64File);
    const chatRequestOptions = {
      data: {
        settings: settings as any,
        imageUrl: base64File || "",
      },
    };

    return handleSubmit(e, chatRequestOptions);
  }

  async function appendMessage(message: string) {
    const chatRequestOptions = {
      data: {
        settings: settings as any,
      },
    };
    append({ role: "user", content: message }, chatRequestOptions);
  }

  return (
    <Box>
      <ThemeProvider>
        <BaseStyles>
          <Box
            sx={{
              display: "flex",
              fontFamily: "sans-serif",
              color: "fg.default",
              flexDirection: "column",
              height: "100vh",
              flexGrow: 0,
              justifyContent: "center",
            }}
          >
            <TitleBar
              currentSettings={settings}
              settingsVisibility={settingsVisibility}
              setSettingsVisibility={setSettingsVisibility}
              onClear={() => {
                stop();
                setMessages([]);
              }}
            />

            <Box
              sx={{
                display: "flex",
                flexGrow: 1,
                width: "100%",
                overflowY: "scroll",
                flexDirection: "row",
                justifyContent: "center",
              }}
            >
              {settingsVisibility === "visible" && (
                <SettingsForm
                  initialValues={settings}
                  setSettingsVisibility={setSettingsVisibility}
                  onSubmit={onSettingsChange}
                />
              )}
              <Box
                sx={{
                  height: "100%",
                  overflowY: "scroll",
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {messages.length ? (
                  <MessageList messages={messages} />
                ) : (
                  <Intro appendMessage={appendMessage} />
                )}
                <Box
                  sx={{
                    borderTop: "1px solid",
                    borderColor: "border.default",
                    p: 3,
                    backgroundColor: "canvas.default",
                  }}
                >
                  <MessageInput
                    fileInputKey={fileInputKey}
                    base64File={base64File}
                    clearFile={clearFile}
                    onFileChange={onFileChange}
                    input={input}
                    onInputChange={handleInputChange}
                    onSubmit={onSubmit}
                    onStop={stop}
                    isLoading={isLoading}
                  />
                </Box>
              </Box>

              <DebugColumn imageAttached={!!base64File} data={debugData} />
            </Box>
          </Box>
        </BaseStyles>
      </ThemeProvider>
    </Box>
  );
}
