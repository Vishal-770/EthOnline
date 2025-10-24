import { LogOut, Settings, User, MessageCircle } from "lucide-react";
import Link from "next/link";

import { ModeToggle } from "./ModeToggle";
import { Button } from "./ui/button";

const NavBar = () => {
  return (
    <nav className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="font-semibold text-foreground hover:text-primary transition-colors"
        >
          ERC20WIZ
        </Link>
        <Link href="/chat">
          <Button variant="ghost" size="sm" className="gap-2">
            <MessageCircle className="w-4 h-4" />
            AI Chat
          </Button>
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <ModeToggle />
      </div>
    </nav>
  );
};

export default NavBar;
