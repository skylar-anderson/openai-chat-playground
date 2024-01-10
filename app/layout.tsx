import "./globals.css";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: "Copilot Chat | Function Calling Prototype",
  description: "Testing the limits of conversational UX",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
