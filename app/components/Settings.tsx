import React, { useRef, useCallback } from "react";
import type { FormEvent } from "react";
import {
  CheckboxGroup,
  FormControl,
  Box,
  Button,
  Checkbox,
  Textarea,
} from "@primer/react";
import type { ChatCompletionCreateParams } from "openai/resources/chat";
import { Dialog } from "@primer/react/drafts";
import { availableFunctions, FunctionName } from "../api/chat/functions";
export type SettingsProps = {
  customInstructions: string;
  tools: string[];
};

type Props = {
  onDismiss: () => void;
  isOpen: boolean;
  initialValues: SettingsProps;
  onSubmit: (s: SettingsProps) => void;
};

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

      onSubmit({
        customInstructions,
        tools,
      });
      onDismiss();
    },
    [onSubmit],
  );

  if (!isOpen) return null;

  return (
    <Dialog onClose={onDismiss} title="Settings" width="large" height="auto">
      <Box as="form" onSubmit={handleSubmit} ref={form}>
        <Box sx={{ overflowY: "scroll", maxHeight: "432px" }}>
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
          <Box display="grid" pt={3} sx={{ gap: 4 }}>
            <CheckboxGroup>
              <CheckboxGroup.Label>Tools</CheckboxGroup.Label>
              {Object.keys(availableFunctions).map((toolName) => {
                const functionName = toolName as FunctionName;
                const tool = availableFunctions[functionName]
                  .meta as ChatCompletionCreateParams.Function;
                return (
                  <FormControl key={tool.name}>
                    <Checkbox
                      value={tool.name}
                      name="tools[]"
                      defaultChecked={initialValues.tools.includes(tool.name)}
                    />
                    <FormControl.Label>
                      <Box>{tool.name}</Box>
                      <Box
                        sx={{
                          fontWeight: "normal",
                          fontSize: 0,
                          color: "fg.muted",
                        }}
                      >
                        {tool.description}
                      </Box>
                    </FormControl.Label>
                  </FormControl>
                );
              })}
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
