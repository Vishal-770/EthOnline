"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { TweetCard } from "./ui/tweet-card";
import { AlertCircle } from "lucide-react";
import { SidebarWrapper } from "./SidebarWrapper";
import axios from "axios";

declare global {
  interface Window {
    rembeddit?: any;
  }
}

interface SocialPost {
  id: string;
  platform: "twitter" | "reddit";
  content: string;
  author: string;
  timestamp: string;
  engagement: {
    likes?: number;
    retweets?: number;
    comments?: number;
    upvotes?: number;
  };
  url?: string;
}

const RedditEmbed = ({ url, postId }: { url: string; postId: string }) => {
  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.rembeddit) {
      const script = document.createElement("script");
      script.src = "https://embed.reddit.com/widgets.js";
      script.async = true;
      script.charset = "UTF-8";
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div ref={embedRef} className="reddit-embed-container">
      <blockquote
        className="reddit-embed-bq"
        data-embed-theme="dark"
        data-embed-showedits="false"
      >
        <a href={url}>{url}</a>
      </blockquote>
    </div>
  );
};

async function fetchSocialPosts() {
  const apiUrl =
    process.env.NEXT_PUBLIC_OFFCHAIN_API_URL || "http://localhost:3002";
  const response = await axios.get(`${apiUrl}/allposts`);
  return response.data;
}

const AppSideBar = () => {
  const [postQueue, setPostQueue] = useState<SocialPost[]>([]);
  const [visiblePosts, setVisiblePosts] = useState<SocialPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const feedContainerRef = useRef<HTMLDivElement>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);
  const queueIndexRef = useRef<number>(0);

  // Fetch posts
  const loadPosts = useCallback(async (force = false) => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    const MIN_FETCH_INTERVAL = 60000; // 1 minute

    if (isFetchingRef.current || (!force && timeSinceLastFetch < MIN_FETCH_INTERVAL)) {
      return;
    }

    isFetchingRef.current = true;

    try {
      const posts = await fetchSocialPosts();

      if (posts && Array.isArray(posts) && posts.length > 0) {
        const validPosts = posts.filter((post: SocialPost) => {
          if (post.platform === "twitter") {
            return post.id && post.id.trim() !== "";
          }
          if (post.platform === "reddit") {
            return post.url && post.url.trim() !== "";
          }
          return false;
        });

        if (validPosts.length > 0) {
          setPostQueue(prevQueue => {
            // First load - just set the posts
            if (prevQueue.length === 0) {
              return validPosts;
            }
            
            // Subsequent loads - merge avoiding duplicates
            const existingIds = new Set(prevQueue.map(p => `${p.platform}-${p.id}`));
            const newPosts = validPosts.filter(
              p => !existingIds.has(`${p.platform}-${p.id}`)
            );
            return [...prevQueue, ...newPosts];
          });

          setError(null);
        }
        lastFetchTimeRef.current = now;
      }
    } catch (err) {
      console.error("Failed to fetch social posts:", err);
      setError("Failed to load posts");
    } finally {
      isFetchingRef.current = false;
      setIsInitialLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadPosts(true);
  }, []);

  // Show first post immediately when queue is populated
  useEffect(() => {
    if (postQueue.length > 0 && visiblePosts.length === 0) {
      setVisiblePosts([postQueue[0]]);
      queueIndexRef.current = 1;
    }
  }, [postQueue.length, visiblePosts.length]);

  // Add posts one by one
  useEffect(() => {
    if (postQueue.length === 0) return;

    const interval = setInterval(() => {
      const currentIndex = queueIndexRef.current;
      
      // Loop back to start
      if (currentIndex >= postQueue.length) {
        queueIndexRef.current = 0;
        loadPosts();
        return;
      }

      const nextPost = postQueue[currentIndex];
      if (!nextPost) return;

      setVisiblePosts(prev => {
        // Check if already visible
        const exists = prev.some(
          p => p.platform === nextPost.platform && p.id === nextPost.id
        );
        
        if (exists) {
          queueIndexRef.current++;
          return prev;
        }

        // Add post
        queueIndexRef.current++;
        return [...prev, nextPost];
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [postQueue, loadPosts]);

  // Prefetch when running low
  useEffect(() => {
    if (postQueue.length === 0) return;

    const checkInterval = setInterval(() => {
      const remaining = postQueue.length - queueIndexRef.current;
      if (remaining <= 5) {
        loadPosts();
      }
    }, 15000);

    return () => clearInterval(checkInterval);
  }, [postQueue.length, loadPosts]);

  // Auto scroll to bottom - scroll the last post into view
  useEffect(() => {
    if (feedContainerRef.current && visiblePosts.length > 0) {
      const container = feedContainerRef.current;
      const lastPost = container.lastElementChild;
      
      if (lastPost) {
        setTimeout(() => {
          lastPost.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'end',
            inline: 'nearest'
          });
        }, 100);
      }
    }
  }, [visiblePosts.length]);

  const handleManualRefresh = () => {
    queueIndexRef.current = 0;
    setPostQueue([]);
    setVisiblePosts([]);
    setIsInitialLoading(true);
    loadPosts(true);
  };

  return (
    <SidebarWrapper>
      <div className="sticky top-0 bg-card/95 backdrop-blur-sm z-10 border-b border-border px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Live Social Feed</h2>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              {error ? "Unable to load posts" : `${visiblePosts.length} posts shown`}
            </p>
          </div>
          <button
            onClick={handleManualRefresh}
            disabled={isInitialLoading}
            className="text-xs px-3 py-1.5 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors disabled:opacity-50"
            title="Refresh posts"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-4 mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      <div className="flex-1 px-4 py-4 overflow-auto" ref={feedContainerRef}>
        {isInitialLoading && visiblePosts.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-4">
              Loading posts...
            </p>
          </div>
        ) : visiblePosts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No posts available</p>
          </div>
        ) : (
          <div className="feed-container space-y-6">
            {visiblePosts.map((post, index) => (
              <div
                key={`${post.platform}-${post.id}`}
                className="post-item animate-slide-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {post.platform === "twitter" ? (
                  <TweetCard id={post.id} />
                ) : (
                  <RedditEmbed url={post.url!} postId={post.id} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .feed-container {
          position: relative;
          min-height: 400px;
        }

        .post-item {
          opacity: 1;
          transform: translateY(0);
        }

        @keyframes slideInFromBottom {
          0% {
            transform: translateY(60px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slideInFromBottom 0.5s ease-out forwards;
        }

        :global(.reddit-embed-bq) {
          margin: 0 !important;
        }

        :global(.reddit-embed-container) {
          width: 100%;
          overflow: hidden;
        }

        :global(.reddit-embed-container iframe) {
          max-width: 100%;
        }
      `}</style>
    </SidebarWrapper>
  );
};

export default AppSideBar;
