import {
  SidebarExpandIcon,
  SidebarCollapseIcon,
  GearIcon,
} from "@primer/octicons-react";
import { IconButton, Box } from "@primer/react";
import { SettingsProps } from "../types";
export type Visibility = "visible" | "hidden";
type Props = {
  settingsVisibility: Visibility;
  setSettingsVisibility: (visibility: Visibility) => void;
  currentSettings: SettingsProps;
};

const rotate = {
  transform: "rotate(180deg)",
};

export default function TitleBar({
  currentSettings,
  settingsVisibility,
  setSettingsVisibility,
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
        }}
      >
        Chatting with {currentSettings.model} using{" "}
        {currentSettings.tools.length} tools
      </Box>
    </Box>
  );
}
