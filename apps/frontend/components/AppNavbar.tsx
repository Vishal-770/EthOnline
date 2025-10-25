"use client";

import { MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ModeToggle } from "./ModeToggle";
import { Button } from "./ui/button";
import { CHAIN_ARRAY } from "@/lib/chains";

const NavBar = () => {
  const pathname = usePathname();


  const currentChain =
    CHAIN_ARRAY.find((chain) => pathname.startsWith(`/${chain.slug}`)) ||
    CHAIN_ARRAY[0]; // Default to Ethereum

  return (
    <nav className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Brand */}
        <Link
          href="/"
          className="font-semibold text-foreground hover:text-primary transition-colors"
        >
          ERC20WIZ
        </Link>

        {/* Replaced dropdown with inline chain links */}
        <div className="flex items-center gap-2">
          {CHAIN_ARRAY.map((chain) => (
            <Link
              key={chain.id}
              href={chain.slug === "ethereum" ? "/" : `/${chain.slug}`}
            >
              <Button
                variant={
                  pathname.startsWith(`/${chain.slug}`) ||
                  (chain.slug === "ethereum" && pathname === "/")
                    ? "secondary"
                    : "ghost"
                }
                size="sm"
              >
                {chain.name}
              </Button>
            </Link>
          ))}
        </div>

        {/* AI Chat link */}
        <Link href="/ai">
          <Button variant="ghost" size="sm" className="gap-2">
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">AI Chat</span>
          </Button>
        </Link>
      </div>

      {/* Mode Toggle */}
      <div className="flex items-center gap-4">
        <ModeToggle />
      </div>
    </nav>
  );
};

export default NavBar;
