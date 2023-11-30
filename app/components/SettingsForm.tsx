import React, { useState, useRef, useCallback } from "react";
import { SidebarExpandIcon, SidebarCollapseIcon } from "@primer/octicons-react";
import type { FormEvent } from "react";
import {
  IconButton,
  CheckboxGroup,
  FormControl,
  Box,
  Button,
  Checkbox,
  Select,
  Textarea,
} from "@primer/react";
import type { ChatCompletionCreateParams } from "openai/resources/chat";
import { availableFunctions, FunctionName } from "../api/chat/functions";
import { SettingsProps } from "../types";
import { indexedRepositories } from "../repositories";
import { FUNCTION_CALLING_MODELS } from "../models";

type Props = {
  initialValues: SettingsProps;
  onSubmit: (s: SettingsProps) => void;
};

function RepositoryOption({
  repository,
  checked,
}: {
  checked: boolean;
  repository: string;
}) {
  return (
    <Box
      sx={{
        py: 1,
      }}
    >
      <FormControl key={repository}>
        <Checkbox
          value={repository}
          name="repositories[]"
          defaultChecked={checked}
        />
        <FormControl.Label>
          <Box>{repository}</Box>
        </FormControl.Label>
      </FormControl>
    </Box>
  );
}

function ToolOption({
  tool,
  checked,
}: {
  checked: boolean;
  tool: ChatCompletionCreateParams.Function;
}) {
  return (
    <Box
      sx={{
        py: 1,
      }}
    >
      <FormControl key={tool.name}>
        <Checkbox value={tool.name} name="tools[]" defaultChecked={checked} />
        <FormControl.Label>
          <Box>{tool.name}</Box>
        </FormControl.Label>
      </FormControl>
    </Box>
  );
}

export default function SettingsForm({ initialValues, onSubmit }: Props) {
  const [isVisible, setIsVisible] = useState<boolean>(false);
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
      //onDismiss();
    },
    [onSubmit],
  );

  if (!isVisible)
    return (
      <IconButton
        icon={SidebarExpandIcon}
        aria-label="Show settings"
        variant="invisible"
        size="small"
        onClick={() => setIsVisible(true)}
        sx={{ position: "absolute", top: 3, left: 3 }}
      >
        Show settings
      </IconButton>
    );

  return (
    <Box
      sx={{
        width: "360px",
        height: "100%",
        borderRight: "1px solid",
        borderColor: "border.default",
        overflowY: "scroll",
      }}
    >
      <Box
        as="form"
        onSubmit={handleSubmit}
        ref={form}
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          height: "100%",
        }}
      >
        <Box sx={{ flexGrow: 1, p: 3, overflowY: "scroll" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              gap: 2,
              fontSize: 3,
              fontWeight: "semibold",
              color: "fg.default",
              pb: 3,
            }}
          >
            <IconButton
              icon={SidebarCollapseIcon}
              aria-label="Hide settings"
              variant="invisible"
              size="small"
              onClick={() => setIsVisible(false)}
            >
              Hide settings
            </IconButton>
            <Box sx={{ flexGrow: 1 }}>Settings</Box>
          </Box>
          <FormControl>
            <FormControl.Label>Model</FormControl.Label>
            <Select sx={{ width: "100%" }}>
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
              <CheckboxGroup.Caption>
                Select which tools are available to the model in this
                conversation
              </CheckboxGroup.Caption>
              <Box>
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
          <Box display="grid" pt={3} sx={{ gap: 4 }}>
            <CheckboxGroup>
              <CheckboxGroup.Label>Retrieval</CheckboxGroup.Label>
              <CheckboxGroup.Caption>
                Select which repositories to include when performing semantic
                code search
              </CheckboxGroup.Caption>
              <Box>
                {Object.entries(indexedRepositories).map(
                  ([repository, ref]) => (
                    <RepositoryOption
                      checked={
                        true /*initialValues.repositories.includes(repository)*/
                      }
                      repository={repository}
                    />
                  ),
                )}
              </Box>
            </CheckboxGroup>
          </Box>
        </Box>
        <Box
          sx={{
            borderTop: "1px solid",
            borderColor: "border.default",
            flexGrow: 0,
            p: 3,
            justifyContent: "flex-end",
            display: "flex",
            gap: "8px",
          }}
        >
          <Button
            type="reset"
            variant="default"
            onClick={() => {
              /*onDismiss*/
            }}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Apply
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
