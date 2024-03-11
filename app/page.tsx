"use client";

import { ThemeProvider, BaseStyles } from "@primer/react";
import Chat from "./components/Chat";
import { handler } from "./action";

export default function Home() {
  return (
    <ThemeProvider>
      <BaseStyles>
        <Chat handler={handler} />
      </BaseStyles>
    </ThemeProvider>
  );
}