import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarSeparator,
} from "./ui/sidebar";
import { TweetCard } from "./ui/tweet-card";

const AppSideBar = async () => {
  // Replace these with actual trending meme coin tweet IDs
  const tweetIds = [
    "1234903157580296192",
    "1234903157580296192",
    "1234903157580296192",
    "1234903157580296192",
  ];

  return (
    <Sidebar className="border-r border-sidebar-border  scrollbar-hide">
      <SidebarHeader className="mt-4 px-4">
        <h2 className="text-xl font-bold text-foreground">Trending Tweets</h2>
        <p className="text-xs text-muted-foreground mt-1">Latest meme coins</p>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto scrollbar-hide px-4 my-5">
        <div className="space-y-6">
          {tweetIds.map((id, index) => (
            <div key={index} className="shrink-0">
              <TweetCard id={id} />
            </div>
          ))}
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default AppSideBar;
