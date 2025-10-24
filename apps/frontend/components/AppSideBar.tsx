import fetchLatestTweets from "@/lib/fetchtweets";
import { TweetCard } from "./ui/tweet-card";
import { AlertCircle } from "lucide-react";
import { SidebarWrapper } from "./SidebarWrapper";

const AppSideBar = async () => {
  // Fallback tweet IDs in case API fails
  const fallbackTweetIds = [
    "1234903157580296192",
    "1981416387588571398",
    "1981415786238661080",
  ];

  let tweets = [];
  let error = null;

  try {
    tweets = await fetchLatestTweets();

    // If no tweets returned, use fallback
    if (!tweets || tweets.length === 0) {
      console.warn("No tweets returned from API, using fallback tweets");
      tweets = fallbackTweetIds.map((id) => ({ id }));
    }
  } catch (err) {
    console.error("Failed to fetch tweets in sidebar:", err);
    error = "Failed to load tweets";
    // Use fallback tweets on error
    tweets = fallbackTweetIds.map((id) => ({ id }));
  }

  return (
    <SidebarWrapper>
      <div className="sticky top-0 bg-card/95 backdrop-blur-sm z-10 border-b border-border px-4 py-4">
        <h2 className="text-xl font-bold text-foreground">Trending Tweets</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {error ? "Showing cached tweets" : "Latest from Ethereum"}
        </p>
      </div>

      {error && (
        <div className="mx-4 mt-4 mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      <div className="flex-1 px-4 py-4">
        <div className="space-y-6">
          {tweets.length > 0 ? (
            tweets.map((tweet: any, index: number) => (
              <div key={tweet.id || index} className="shrink-0">
                <TweetCard id={tweet.id} />
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                No tweets available
              </p>
            </div>
          )}
        </div>
      </div>
    </SidebarWrapper>
  );
};

export default AppSideBar;
