"use client";
import { Box, BaseStyles, IconButton, ThemeProvider } from "@primer/react";
import { useChat } from "ai/react";
import { useState } from "react";
import MessageList from "./components/MessageList";
import SettingsForm from "./components/SettingsForm";
import { FUNCTION_CALLING_MODELS } from "./models";
import { availableFunctions, FunctionName } from "./api/chat/functions";
import useLocalStorage from "./hooks/useLocalStorage";
import { SettingsProps } from "./types";
import MessageInput from "./components/MessageInput";
import FunctionDebugger from "./components/FunctionDebugger";
import Intro from "./components/Intro";
import TitleBar, { Visibility } from "./components/TitleBar";
const defaultInstructions = ``;

const tools = Object.keys(availableFunctions) as FunctionName[];

function DebugColumn({ data }: { data?: any[] }) {
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
      {data &&
        data.map((d, i) => <FunctionDebugger key={i} functionData={d} />)}
      {!data?.length && (
        <Box p={3} sx={{ fontSize: 0, textAlign: "center", color: "fg.muted" }}>
          Function calls will appear here
        </Box>
      )}
    </Box>
  );
}

export default function Chat() {
  const [settingsVisibility, setSettingsVisibility] =
    useState<Visibility>("hidden");
  const { data, isLoading, messages, input, handleInputChange, handleSubmit } =
    useChat();

  const [settings, setSettings] = useLocalStorage<SettingsProps>("settings", {
    customInstructions: defaultInstructions,
    tools: tools,
    model: FUNCTION_CALLING_MODELS[0],
  });

  function onSettingsChange(settings: SettingsProps) {
    setSettings(settings);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (isLoading) return false;

    const chatRequestOptions = {
      data: {
        settings: settings as any,
      },
    };

    return handleSubmit(e, chatRequestOptions);
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
                  backgroundColor: "canvas.subtle",
                }}
              >
                {messages.length ? (
                  <MessageList messages={messages} />
                ) : (
                  <Intro />
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
                    input={input}
                    onInputChange={handleInputChange}
                    onSubmit={onSubmit}
                    isLoading={isLoading}
                  />
                </Box>
              </Box>

              <DebugColumn data={data} />
            </Box>
          </Box>
        </BaseStyles>
      </ThemeProvider>
    </Box>
  );
}
