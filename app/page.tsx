"use client";
import { GearIcon, PaperAirplaneIcon } from "@primer/octicons-react";
import {
  IconButton,
  TextInput,
  Box,
  BaseStyles,
  ThemeProvider,
} from "@primer/react";
import { useState } from "react";
import { useChat } from "ai/react";
import MessageList from "./components/MessageList";
import Settings, { SettingsProps } from "./components/Settings";
import { availableFunctions, FunctionName } from "./api/chat/functions";
import useLocalStorage from "./hooks/useLocalStorage";
const defaultInstructions = `You are a helpful coding assistant that assists users with coding questions
about the swr react hook.
You have the ability to perform a semantic code search against the source code of swr.
Please use this ability to answer questions about how swr works. Do not attempt to
answer questions using your own knowledge. Only use the functions provided to you.
`;

const tools = Object.keys(availableFunctions) as FunctionName[];

export default function Chat() {
  const { data, isLoading, messages, input, handleInputChange, handleSubmit } =
    useChat();

  const [settings, setSettings] = useLocalStorage<SettingsProps>('settings', {
    customInstructions: defaultInstructions,
    tools: tools,
  });

  const [showSettings, setShowSettings] = useState<boolean>(false);
  function onSettingsChange(settings: SettingsProps) {
    setSettings(settings);
  }

  async function submit(...args: unknown[]) {
    if (isLoading) return false;
    
    const chatRequestOptions = {
      data: {
        settings: settings as any,
      },
    };

    return handleSubmit(
      args[0] as React.FormEvent<HTMLFormElement>,
      chatRequestOptions,
    );
  }

  return (
    <ThemeProvider>
      <BaseStyles>
        <Box
          sx={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Settings
            onDismiss={() => setShowSettings(false)}
            isOpen={showSettings}
            initialValues={settings}
            onSubmit={onSettingsChange}
          />

          <MessageList data={data} messages={messages} />

          <Box
            as="form"
            onSubmit={submit}
            sx={{ padding: 3, display: "flex", gap: "8px" }}
          >
            <IconButton
              icon={GearIcon}
              size="large"
              aria-label="Settings"
              onClick={() => setShowSettings(!showSettings)}
            >
              Settings {showSettings ? "Show" : "Hide"}
            </IconButton>
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
              value={input}
              block={true}
              placeholder={isLoading ? "Loading..." : "Ask Copilot..."}
              size="large"
              autoFocus={true}
              loading={isLoading}
              onChange={handleInputChange}
            />
          </Box>
        </Box>
      </BaseStyles>
    </ThemeProvider>
  );
}
