import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";

import { SidebarTrigger } from "./ui/sidebar";
import { ModeToggle } from "./ModeToggle";

const NavBar = () => {
  return (
    <nav className="flex items-center justify-between p-4">
      <SidebarTrigger />
      <div className="flex items-center gap-4 ">
        <Link href="/">Dashboard</Link>
        <ModeToggle />
      </div>
    </nav>
  );
};

export default NavBar;
