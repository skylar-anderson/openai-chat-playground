"use client";
import { useMemo } from "react";
import { Box, BaseStyles, ThemeProvider } from "@primer/react";
import { useState } from "react";
import { useChat } from "ai/react";
import MessageList from "./components/MessageList";
import SettingsForm, {
  FUNCTION_CALLING_MODELS,
} from "./components/SettingsForm";
import { availableFunctions, FunctionName } from "./api/chat/functions";
import useLocalStorage from "./hooks/useLocalStorage";
import { MessageWithDebugData, FunctionData, SettingsProps } from "./types";
import MessageInput from "./components/MessageInput";
import CurrentMessageViewer from "./components/CurrentMessageViewer";

const defaultInstructions = ``;

const tools = Object.keys(availableFunctions) as FunctionName[];

function ChatColumn({ fullWidth, children }: { fullWidth: boolean, children: React.ReactNode }) {
  return (
    <Box
      sx={{
        height: "100%",
        flexGrow: 1,
        //maxWidth: "960px",
        display: "flex",
        p: 3,
        flexDirection: "column",
      }}
    >
      {children}
    </Box>
  );
}


export default function Chat() {
  const { data, isLoading, messages, input, handleInputChange, handleSubmit } =
    useChat();
  const allFunctionData = data as unknown as FunctionData[];
  const [currentMessage, setCurrentMessage] =
    useState<MessageWithDebugData | null>(null);
  const [settings, setSettings] = useLocalStorage<SettingsProps>("settings", {
    customInstructions: defaultInstructions,
    tools: tools,
    model: FUNCTION_CALLING_MODELS[0],
  });

  const [showSettings, setShowSettings] = useState<boolean>(false);
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

  const messagesWithDebugData = useMemo(
    () =>
      messages.map((message, i) => {
        const dataIndex = i === 0 ? i : (i - 1) / 2;
        const debugData =
          allFunctionData && allFunctionData[dataIndex]
            ? allFunctionData[dataIndex]
            : null;
        const showFunctionDebugger =
          debugData && debugData.signature !== "NO_FUNCTION_CALLED"
            ? true
            : false;

        return {
          id: i,
          message,
          debugData,
          showFunctionDebugger,
        };
      }) as MessageWithDebugData[],
    [messages, data],
  );

  return (
    <ThemeProvider>
      <BaseStyles>
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            height: "100vh",
            justifyContent: "center",
          }}
        >
          
          <SettingsForm
            initialValues={settings}
            onSubmit={onSettingsChange}
          />
          
          <ChatColumn fullWidth={currentMessage===null}>
            <MessageList
              onSelectMessage={setCurrentMessage}
              onDismiss={() => setCurrentMessage(null)}
              currentMessage={currentMessage}
              messages={messagesWithDebugData}
            />

            <MessageInput
              input={input}
              onInputChange={handleInputChange}
              onSubmit={onSubmit}
              isLoading={isLoading}
            />
          </ChatColumn>
          
          {currentMessage ? (
            <CurrentMessageViewer
              messageWithDebugData={currentMessage}
              onDismiss={() => setCurrentMessage(null)}
            />
          ) : null}
        </Box>
      </BaseStyles>
    </ThemeProvider>
  );
}
