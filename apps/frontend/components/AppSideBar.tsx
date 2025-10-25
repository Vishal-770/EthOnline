"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { TweetCard } from "./ui/tweet-card";
import { AlertCircle } from "lucide-react";
import { SidebarWrapper } from "./SidebarWrapper";
import axios from "axios";

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
  const response = await axios.get(`http://localhost:3002/allposts`);
  return response.data;
}

const AppSideBar = () => {
  const [allPosts, setAllPosts] = useState<SocialPost[]>([]);
  const [visiblePosts, setVisiblePosts] = useState<SocialPost[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const feedContainerRef = useRef<HTMLDivElement>(null);

  // Fetch posts from API
  const loadPosts = useCallback(async () => {
    try {
      const posts = await fetchSocialPosts();

      if (posts && Array.isArray(posts)) {
        const validPosts = posts.filter((post: SocialPost) => {
          if (post.platform === "twitter") {
            return post.id && post.id.trim() !== "";
          }
          if (post.platform === "reddit") {
            return post.url && post.url.trim() !== "";
          }
          return false;
        });

        setAllPosts(validPosts);
        if (visiblePosts.length === 0 && validPosts.length > 0) {
          setVisiblePosts(validPosts.slice(0, Math.min(3, validPosts.length)));
        }
        setError(null);
      }
    } catch (err) {
      console.error("Failed to fetch social posts:", err);
      setError("Failed to load posts");
    } finally {
      setIsLoading(false);
    }
  }, [visiblePosts.length]);

  // Initial load
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Add new post with smooth animation and auto-scroll
  useEffect(() => {
    if (allPosts.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % allPosts.length;

        // If we're 3-4 posts away from the end, refetch
        if (nextIndex >= allPosts.length - 3) {
          loadPosts();
        }

        // Add new post, shift existing posts up
        setVisiblePosts((prev) => {
          const newPost = allPosts[nextIndex];
          if (!newPost) return prev;

          // Keep up to 3 posts, append new post
          const updated = [...prev, newPost].slice(-3);
          return updated;
        });

        return nextIndex;
      });
    }, 5000); // New post every 5 seconds

    return () => clearInterval(interval);
  }, [allPosts, loadPosts]);

  // Auto-scroll to the bottom when new posts are added
  useEffect(() => {
    if (feedContainerRef.current && visiblePosts.length > 0) {
      const lastPost = feedContainerRef.current.lastElementChild;
      if (lastPost) {
        lastPost.scrollIntoView({ behavior: "smooth", block: "end" });
      }
    }
  }, [visiblePosts]);

  return (
    <SidebarWrapper>
      <div className="sticky top-0 bg-card/95 backdrop-blur-sm z-10 border-b border-border px-4 py-4">
        <h2 className="text-xl font-bold text-foreground">Live Social Feed</h2>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          {error ? "Unable to load posts" : "Real-time updates"}
        </p>
      </div>

      {error && (
        <div className="mx-4 mt-4 mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      <div className="flex-1 px-4 py-4 overflow-auto">
        {isLoading && visiblePosts.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-sm text-muted-foreground mt-4">Loading posts...</p>
          </div>
        ) : visiblePosts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No posts available</p>
          </div>
        ) : (
          <div className="feed-container space-y-6" ref={feedContainerRef}>
            {visiblePosts.map((post, index) => (
              <div
                key={`${post.platform}-${post.id}`}
                className={`post-item transition-all duration-500 ease-out ${
                  index === visiblePosts.length - 1 ? "animate-slide-in" : "animate-slide-up"
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
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
        }

        .post-item {
          opacity: 1;
          transform: translateY(0);
        }

        @keyframes slideInFromBottom {
          0% {
            transform: translateY(100px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideUp {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-20px);
          }
        }

        .animate-slide-in {
          animation: slideInFromBottom 0.6s ease-out forwards;
        }

        .animate-slide-up {
          animation: slideUp 0.4s ease-out forwards;
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