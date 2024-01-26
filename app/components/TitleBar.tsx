import {
  SidebarExpandIcon,
  SyncIcon,
  SidebarCollapseIcon,
  GearIcon,
} from "@primer/octicons-react";
import { Button, IconButton, Box } from "@primer/react";
import { Provider, SettingsProps } from "../types";
import { presentProvider } from "../utils/provider";
import pluralize from "../utils/pluralize";
export type Visibility = "visible" | "hidden";
type Props = {
  settingsVisibility: Visibility;
  setSettingsVisibility: (visibility: Visibility) => void;
  currentSettings: SettingsProps;
  onClear: () => void;
};

const rotate = {
  transform: "rotate(180deg)",
};

export default function TitleBar({
  currentSettings,
  settingsVisibility,
  setSettingsVisibility,
  onClear,
}: Props) {
  return (
    <Box
      sx={{
        paddingY: 2,
        paddingX: 3,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: 2,
        width: "100%",
        borderBottom: "1px solid",
        borderColor: "border.default",
      }}
    >
      {settingsVisibility === "visible" ? (
        <IconButton
          icon={SidebarCollapseIcon}
          aria-label="Hide settings"
          variant="invisible"
          size="small"
          sx={rotate}
          onClick={() => setSettingsVisibility("hidden")}
        >
          Hide settings
        </IconButton>
      ) : (
        <IconButton
          icon={GearIcon}
          aria-label="Show settings"
          variant="invisible"
          size="small"
          sx={rotate}
          onClick={() => setSettingsVisibility("visible")}
        >
          Show settings
        </IconButton>
      )}

      <Box
        sx={{
          fontSize: 1,
          color: "fg.default",
          flex: 1,
        }}
      >
        Chatting with {presentProvider(currentSettings.provider)} {currentSettings.provider === Provider.OPENAI && `(${currentSettings.model})`} using{" "}
        {currentSettings.tools.length}{" "}
        {pluralize(currentSettings.parallelize ? "tool" : "function", currentSettings.tools.length)}.
      </Box>
      <Button onClick={onClear} leadingVisual={SyncIcon}>
        Clear
      </Button>
    </Box>
  );
}
