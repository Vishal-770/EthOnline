import axios, { AxiosError } from "axios";
import { env } from "./env";

interface Tweet {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
}

interface TwitterAPIResponse {
  tweets: Tweet[];
  meta?: {
    result_count: number;
  };
}

interface TwitterAPIError {
  error?: string;
  message?: string;
}

async function fetchLatestTweets(): Promise<Tweet[]> {
  try {
    const response = await axios.get<TwitterAPIResponse>(
      `${env.twitterApiUrl}/twitter/tweet/advanced_search?queryType=Latest&query=Ethereum&maxResults=10`,
      {
        headers: {
          "X-API-Key": env.twitterApiKey,
        },
        timeout: 10000, // 10 second timeout
      }
    );

    if (!response.data || !response.data.tweets) {
      console.warn("No tweets found in API response");
      return [];
    }

    console.log(`Successfully fetched ${response.data.tweets.length} tweets`);
    return response.data.tweets;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<TwitterAPIError>;

      if (axiosError.response) {
        // Server responded with error status
        console.error(
          `Twitter API Error (${axiosError.response.status}):`,
          axiosError.response.data?.error ||
            axiosError.response.data?.message ||
            "Unknown error"
        );
      } else if (axiosError.request) {
        // Request made but no response received
        console.error(
          "No response from Twitter API - Network error or timeout"
        );
      } else {
        // Error in request setup
        console.error(
          "Error setting up Twitter API request:",
          axiosError.message
        );
      }
    } else {
      // Non-Axios error
      console.error("Unexpected error fetching tweets:", error);
    }

    // Return empty array instead of undefined to prevent crashes
    return [];
  }
}

export default fetchLatestTweets;
export type { Tweet, TwitterAPIResponse };
