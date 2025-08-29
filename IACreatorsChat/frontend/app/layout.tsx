import "./styles/globals.css";
import React from "react";

export const metadata = {
  title: "Chat App",
  description: "Login + Chat SSE",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br">
      <body>{children}</body>
    </html>
  );
}
