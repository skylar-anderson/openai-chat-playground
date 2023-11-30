import React, { useRef, useCallback } from "react";
import type { FormEvent } from "react";
import {
  CheckboxGroup,
  FormControl,
  Box,
  Button,
  Checkbox,
  Select,
  Textarea,
} from "@primer/react";
import type { ChatCompletionCreateParams } from "openai/resources/chat";
import { Dialog } from "@primer/react/drafts";
import { availableFunctions, FunctionName } from "../api/chat/functions";

export const FUNCTION_CALLING_MODELS = [
  "gpt-4-1106-preview",
  "gpt-4",
  "gpt-4-0613",
  "gpt-3.5-turbo",
  "gpt-3.5-turbo-1106",
  "gpt-3.5-turbo-0613",
] as const;

export type Model = (typeof FUNCTION_CALLING_MODELS)[number];

export type SettingsProps = {
  customInstructions: string;
  tools: string[];
  model: Model;
};

type Props = {
  onDismiss: () => void;
  isOpen: boolean;
  initialValues: SettingsProps;
  onSubmit: (s: SettingsProps) => void;
};

{/* <Settings
onDismiss={() => setShowSettings(false)}
isOpen={showSettings}
initialValues={settings}
onSubmit={onSettingsChange}
/> */}


function ToolOption({
  tool,
  checked,
}: {
  checked: boolean;
  tool: ChatCompletionCreateParams.Function;
}) {
  return (
    <Box
      p={3}
      sx={{
        "&:last-child": { border: 0 },
        borderBottom: "1px solid",
        borderColor: "border.default",
      }}
    >
      <FormControl key={tool.name}>
        <Checkbox value={tool.name} name="tools[]" defaultChecked={checked} />
        <FormControl.Label>
          <Box>{tool.name}</Box>
          <Box
            sx={{
              fontWeight: "normal",
              fontSize: 0,
              color: "fg.muted",
            }}
          >
            <Box
              as="pre"
              sx={{
                margin: 0,
                whiteSpace: "pre-line",
                padding: 0,
              }}
            >
              {tool.description}
            </Box>
          </Box>
        </FormControl.Label>
      </FormControl>
    </Box>
  );
}

const Settings = ({ onDismiss, isOpen, initialValues, onSubmit }: Props) => {
  const form = useRef<HTMLFormElement>(null);
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const data = new FormData(form.current!);
      const customInstructions = (
        data.get("customInstructions") as string
      ).trim();
      const tools = data.getAll("tools[]") as string[];
      const model = data.get("model") as Model;

      onSubmit({
        customInstructions,
        tools,
        model,
      });
      onDismiss();
    },
    [onSubmit],
  );

  if (!isOpen) return null;

  return (
    <Dialog onClose={onDismiss} title="Settings" width="xlarge" height="auto">
      <Box as="form" onSubmit={handleSubmit} ref={form}>
        <Box sx={{ overflowY: "scroll" }}>
          <FormControl>
            <FormControl.Label>Model</FormControl.Label>
            <FormControl.Caption>
              See{" "}
              <a
                target="_blank"
                href="https://platform.openai.com/docs/guides/function-calling/supported-models"
              >
                OpenAI Docs
              </a>{" "}
              for tips on model selection.
            </FormControl.Caption>
            <Select>
              {FUNCTION_CALLING_MODELS.map((model) => (
                <Select.Option
                  selected={model === initialValues.model}
                  key={model}
                  value={model}
                >
                  {model}
                </Select.Option>
              ))}
            </Select>
          </FormControl>
          <Box pt={3}>
            <FormControl id="customInstructions">
              <FormControl.Label>Custom instructions</FormControl.Label>
              <Textarea
                resize="vertical"
                rows={8}
                sx={{ width: "100%" }}
                name="customInstructions"
                defaultValue={initialValues.customInstructions}
                placeholder="Enter custom instructions"
              />
            </FormControl>
          </Box>
          <Box display="grid" pt={3} sx={{ gap: 4 }}>
            <CheckboxGroup>
              <CheckboxGroup.Label>Tools</CheckboxGroup.Label>
              <Box
                sx={{
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: "border.default",
                }}
              >
                {Object.keys(availableFunctions).map((toolName) => {
                  const functionName = toolName as FunctionName;
                  const tool = availableFunctions[functionName]
                    .meta as ChatCompletionCreateParams.Function;
                  return (
                    <ToolOption
                      checked={initialValues.tools.includes(tool.name)}
                      tool={tool}
                    />
                  );
                })}
              </Box>
            </CheckboxGroup>
          </Box>
        </Box>
        <Box
          pt={3}
          sx={{ justifyContent: "flex-end", display: "flex", gap: "8px" }}
        >
          <Button type="reset" variant="default" onClick={onDismiss}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Submit
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
};

export default Settings;
