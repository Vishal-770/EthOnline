import {
  Activity,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUpIcon,
  FileQuestion,
  Headset,
  HelpCircle,
  Home,
  Inbox,
  MessageCircle,
  MessageSquare,
  PlayCircle,
  Plus,
  Projector,
  Search,
  Send,
  Settings,
  User2,
  Users,
  View,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
  SidebarGroupAction,
  SidebarMenuBadge,
} from "./ui/sidebar";
import Link from "next/link";
// import Image from "next/image";
// import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

const AppSideBar = () => {
  const items = [
    {
      title: "Home",
      url: "#",
      icon: Home,
    },
    {
      title: "Inbox",
      url: "#",
      icon: Inbox,
    },
    {
      title: "Calendar",
      url: "#",
      icon: Calendar,
    },
    {
      title: "Search",
      url: "#",
      icon: Search,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
  ];
  const resourcesSection = [
    {
      title: "Help Center",
      url: "#",
      icon: HelpCircle,
    },
    {
      title: "Documentation",
      url: "#",
      icon: BookOpen,
    },
    {
      title: "Tutorials",
      url: "#",
      icon: PlayCircle,
    },
    {
      title: "FAQs",
      url: "#",
      icon: FileQuestion,
    },
    {
      title: "Community Forum",
      url: "#",
      icon: Users,
    },
  ];
  const supportSection = [
    {
      title: "Contact Support",
      url: "#",
      icon: Headset,
    },
    {
      title: "Live Chat",
      url: "#",
      icon: MessageCircle,
    },
    {
      title: "Submit a Ticket",
      url: "#",
      icon: Send,
    },
    {
      title: "System Status",
      url: "#",
      icon: Activity,
    },
    {
      title: "Feedback",
      url: "#",
      icon: MessageSquare,
    },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="mt-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/">
                <User2 />
                <span>My Website</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator className="w-[90%] mx-auto" />
      <SidebarContent>
        {/*  Group 1 */}
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/*  Group 1 end here */}
        {/* Group 2 starts here  */}
        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>

          <SidebarGroupAction>
            <Plus />
            <span className="sr-only">Add Items</span>
          </SidebarGroupAction>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/">
                  <View />
                  See All Projects
                </Link>
              </SidebarMenuButton>
              <SidebarMenuBadge>24</SidebarMenuBadge>
              <SidebarMenuButton asChild>
                <Link href="/">
                  <Projector />
                  Add Projects
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        {/* Group 2 ends here  */}

        {/* Side Bar group 3 starts here  */}

        {/* group 3 ends here  */}
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSideBar;
