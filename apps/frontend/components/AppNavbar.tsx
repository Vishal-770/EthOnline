"use client";

import { MessageCircle, TrendingUp, Menu, X, Bot } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ModeToggle } from "./ModeToggle";
import { Button } from "./ui/button";
import { CHAIN_ARRAY } from "@/lib/chains";
import { WalletButton } from "./WalletButton";

const NavBar = () => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const currentChain =
    CHAIN_ARRAY.find((chain) => pathname.startsWith(`/${chain.slug}`)) ||
    CHAIN_ARRAY[0];

  return (
    <nav className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-border bg-card/80 backdrop-blur-xl sticky top-0 z-50">
      {/* LEFT: Brand */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl font-extrabold tracking-tight  ">
            Meme-Sentinel
          </span>
        </Link>
      </div>

      {/* MIDDLE: Desktop Navigation */}
      <div className="hidden md:flex items-center gap-4">
        {/* Chain Selection */}
        <div className="flex items-center gap-1">
          {CHAIN_ARRAY.map((chain) => (
            <Link key={chain.id} href={`/${chain.slug}`}>
              <Button
                variant={
                  pathname.startsWith(`/${chain.slug}`) ? "secondary" : "ghost"
                }
                size="sm"
                className="relative font-medium transition-colors"
              >
                {chain.name}
                {pathname.startsWith(`/${chain.slug}`) && (
                  <div className="absolute -bottom-1 left-1/2 w-1 h-1 bg-primary rounded-full -translate-x-1/2" />
                )}
              </Button>
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div className="h-5 w-px bg-border/50 mx-1" />

        {/* Page Links */}
        <div className="flex items-center gap-1">
          <Link href="/analyze">
            <Button
              variant={pathname === "/analyze" ? "secondary" : "ghost"}
              size="sm"
              className="gap-2 font-medium transition-colors"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Analyze Tokens</span>
            </Button>
          </Link>

          <Link href="/chat">
            <Button
              variant={pathname === "/chat" ? "secondary" : "ghost"}
              size="sm"
              className="gap-2 font-medium text-blue-600 hover:text-blue-700 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>AI Assistant</span>
            </Button>
          </Link>
          <Link href="/agent">
            <Button
              variant={pathname === "/agent" ? "secondary" : "ghost"}
              size="sm"
              className="gap-2 font-medium text-purple-600 hover:text-purple-700 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition-colors"
            >
              <Bot className="w-4 h-4" />
              <span>AI Agent</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* RIGHT: Wallet Button + Mode Toggle + Mobile Menu Button */}
      <div className="flex items-center gap-2">
        <WalletButton />
        <ModeToggle />
        <button
          className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="absolute top-full left-0 w-full bg-card border-t border-border md:hidden animate-in slide-in-from-top-5 duration-200">
          <div className="flex flex-col p-4 space-y-3">
            {CHAIN_ARRAY.map((chain) => (
              <Link
                key={chain.id}
                href={`/${chain.slug}`}
                onClick={() => setMenuOpen(false)}
              >
                <Button
                  variant={
                    pathname.startsWith(`/${chain.slug}`)
                      ? "secondary"
                      : "ghost"
                  }
                  size="sm"
                  className="w-full justify-start"
                >
                  {chain.name}
                </Button>
              </Link>
            ))}

            <hr className="border-border/50 my-2" />

            <Link href="/analyze" onClick={() => setMenuOpen(false)}>
              <Button
                variant={pathname === "/analyze" ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Analyze Tokens
              </Button>
            </Link>

            <Link href="/chat" onClick={() => setMenuOpen(false)}>
              <Button
                variant={pathname === "/chat" ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-start gap-2 text-blue-600 border border-blue-500/20 bg-blue-500/10"
              >
                <MessageCircle className="w-4 h-4" />
                AI Assistant
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
