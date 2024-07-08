"use client";

import { ThemeProvider, BaseStyles } from "@primer/react";
import Chat from "./components/Chat";

export default function Home() {
  return (
    <ThemeProvider>
      <BaseStyles>
        <Chat />
      </BaseStyles>
    </ThemeProvider>
  );
}
