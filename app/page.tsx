"use client";
import { Box, BaseStyles, ThemeProvider } from "@primer/react";
import { useChat } from "ai/react";
import { useState } from "react";
import MessageList from "./components/MessageList";
import SettingsForm from "./components/SettingsForm";
import { FUNCTION_CALLING_MODELS } from "./models";
import { availableFunctions, FunctionName } from "./api/chat/functions";
import useLocalStorage from "./hooks/useLocalStorage";
import { SettingsProps, FunctionData, Provider } from "./types";
import MessageInput from "./components/MessageInput";
import Intro from "./components/Intro";
import TitleBar, { Visibility } from "./components/TitleBar";
import DebugColumn from "./components/Debugger/Column";
import { toBase64 } from "./utils/image";
import { prompts } from './custom-prompts'
const defaultInstructions = ``;
const tools = Object.keys(availableFunctions) as FunctionName[];

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
    provider: Provider.OPENAI
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
    append({ role: "system", content: message }, chatRequestOptions);
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
              <Box sx={{
                width: '320px',
                borderRight: '1px solid',
                borderColor: 'border.default',
                fontSize: 1,
                p:3
              }}>
                <Box sx={{fontWeight: 600, color: 'fg.default'}}>Custom prompts</Box>
                <Box sx={{ color: 'fg.muted', mb: 1, fontSize: 0 }}>Pre-written prompts that execute an interesting task.</Box>
                <Box>
                  {prompts.map(p => (
                    <Box sx={{cursor: 'pointer'}} as="button" onClick={() => appendMessage(p.prompt)}>
                      {p.title}
                    </Box>
                  ))}
                </Box>
              </Box>
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
