import type { Metadata } from "next";
import ThemeProviderWrapper from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "MemeSentinel AI Chat - Crypto Analysis",
  description: "Chat with AI-powered memecoin analysis assistant",
};

export default function ChatLayout(props: any) {
  // Use a permissive props type here to avoid cross-package React type
  // mismatches during production builds (CI/Vercel). ThemeProvider will
  // forward children to the underlying provider.
  return <ThemeProviderWrapper>{props.children}</ThemeProviderWrapper>;
}
