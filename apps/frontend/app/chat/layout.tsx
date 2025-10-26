import type { Metadata } from "next";
import type { ReactNode } from "react";
import ThemeProviderWrapper from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "MemeSentinel AI Chat - Crypto Analysis",
  description: "Chat with AI-powered memecoin analysis assistant",
};

export default function ChatLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ThemeProviderWrapper>
      {children}
    </ThemeProviderWrapper>
  );
}