import type { Metadata } from "next";
import ThemeProviderWrapper from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "MemeSentinel AI Chat - Crypto Analysis",
  description: "Chat with AI-powered memecoin analysis assistant",
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProviderWrapper>
      {children}
    </ThemeProviderWrapper>
  );
}