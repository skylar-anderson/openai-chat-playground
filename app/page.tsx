"use client";
import { Box, BaseStyles, ThemeProvider } from "@primer/react";
import { useChat } from "ai/react";
import MessageList from "./components/MessageList";
import SettingsForm from "./components/SettingsForm";
import { FUNCTION_CALLING_MODELS } from "./models";
import { availableFunctions, FunctionName } from "./api/chat/functions";
import useLocalStorage from "./hooks/useLocalStorage";
import { SettingsProps } from "./types";
import MessageInput from "./components/MessageInput";
import FunctionDebugger from "./components/FunctionDebugger";
import Intro from "./components/Intro";
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
        width: "640px",
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
  const { data, isLoading, messages, input, handleInputChange, handleSubmit } =
    useChat();

  const [settings, setSettings] = useLocalStorage<SettingsProps>("settings", {
    customInstructions: defaultInstructions,
    tools: tools,
    model: FUNCTION_CALLING_MODELS[0],
  });

  function onSettingsChange(settings: SettingsProps) {
    console.log("settings changed", settings);
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
              flexDirection: "row",
              height: "100vh",
              justifyContent: "center",
            }}
          >
            <SettingsForm
              initialValues={settings}
              onSubmit={onSettingsChange}
            />

            <Box
              sx={{
                height: "100%",
                flexGrow: 1,
                display: "flex",
                p: 3,
                flexDirection: "column",
              }}
            >
              {messages.length ? (
                <MessageList messages={messages} />
              ) : (
                <Intro />
              )}

              <MessageInput
                input={input}
                onInputChange={handleInputChange}
                onSubmit={onSubmit}
                isLoading={isLoading}
              />
            </Box>

            <DebugColumn data={data} />
          </Box>
        </BaseStyles>
      </ThemeProvider>
    </Box>
  );
}
