import type { Metadata } from "next";
import { Saira, Fira_Code } from "next/font/google";
import "./globals.css";
import AppSideBar from "@/components/AppSideBar";
import NavBar from "@/components/AppNavbar";
import ThemeProviderWrapper from "@/components/ThemeProvider";
import { WalletProviders } from "@/components/WalletProviders";

const saira = Saira({
  variable: "--font-saira",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MemeSentinal | AI-Powered Meme Coin Trading & Analytics",
  description:
    "MemeSentinal is an AI-driven platform for analyzing, tracking, and automating meme coin trading. Gain insights, follow trends, and optimize your crypto moves with intelligent automation.",
};


export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${saira.variable} ${firaCode.variable} antialiased min-h-screen overflow-x-hidden`}
      >
        <ThemeProviderWrapper>
          <WalletProviders>
            <div className="flex flex-col h-screen">
              <NavBar />
              <div className="flex flex-1 overflow-hidden relative">
                <AppSideBar />
                <main className="flex-1 overflow-y-auto w-full">
                  <div className="px-3 sm:px-4 md:px-6 py-4 md:py-6">
                    {children}
                  </div>
                </main>
              </div>
            </div>
          </WalletProviders>
        </ThemeProviderWrapper>
      </body>
    </html>
  );
}
