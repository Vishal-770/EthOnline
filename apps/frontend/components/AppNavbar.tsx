import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";

import { SidebarTrigger } from "./ui/sidebar";
import { ModeToggle } from "./ModeToggle";

const NavBar = () => {
  return (
    <nav className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="h-6 w-6" />
        <Link
          href="/"
          className="font-semibold text-foreground hover:text-primary transition-colors"
        >
          Dashboard
        </Link>
      </div>
      <div className="flex items-center gap-4">
        <ModeToggle />
      </div>
    </nav>
  );
};

export default NavBar;
