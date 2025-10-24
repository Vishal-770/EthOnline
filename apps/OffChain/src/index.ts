import 'dotenv/config';
import { TwitterApi  } from 'twitter-api-v2';
import type {TweetV2SingleResult, Tweetv2SearchParams} from 'twitter-api-v2';
import Snoowrap from 'snoowrap';
import type { Submission } from 'snoowrap';

type CryptoKeywords = string[];

const cryptoKeywords: CryptoKeywords = [
  'dogecoin', 'shiba inu', 'pepecoin', 'kishu inu', 'floki inu',
  'meme coin', 'crypto pump', 'altcoin', 'defi', 'nft', 'blockchain'
];

const twitterClient: TwitterApi = new TwitterApi(process.env.TWITTER_BEARER_TOKEN!);

const redditClient: Snoowrap = new Snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT!,
  clientId: process.env.REDDIT_CLIENT_ID!,
  clientSecret: process.env.REDDIT_CLIENT_SECRET!,
  username: process.env.REDDIT_USERNAME!,
  password: process.env.REDDIT_PASSWORD!,
});

async function fetchTweets(): Promise<void> {
  console.log('Fetching tweets...');

  const query: string = cryptoKeywords.map(k => `"${k}"`).join(' OR ') + ' -is:retweet lang:en';

  const params: Tweetv2SearchParams = {
    query,
    'tweet.fields': ['id', 'text', 'created_at', 'author_id'],
    max_results: 50,
  };

  const tweets: TweetV2SingleResult[] = [];
  const response = await twitterClient.v2.search(params);

  for await (const tweet of response) {
    tweets.push(tweet);
  }

  console.log(`\n--- ${tweets.length} Tweets ---`);
  tweets.forEach(t => {
    console.log(`[${t.created_at}] (${t.author_id}) ${t.text}`);
  });
}

// ------------------ FETCH REDDIT POSTS --------------------
async function fetchReddit(): Promise<void> {
  console.log('Fetching Reddit posts...');
  const subreddits: string[] = ['CryptoCurrency', 'Bitcoin', 'ethtrader', 'CryptoMarkets'];

  const posts: Submission[] = [];

  for (const sub of subreddits) {
    const subreddit = await redditClient.getSubreddit(sub);
    for (const keyword of cryptoKeywords) {
      const results: Submission[] = await subreddit.search({
        query: keyword,
        sort: 'new',
        time: 'week',
        limit: 10,
      });

      results.forEach(p => posts.push(p));
    }
  }

  console.log(`\n--- ${posts.length} Reddit Posts ---`);
  posts.forEach(p => {
    console.log(`[${new Date(p.created_utc * 1000).toISOString()}] (${p.subreddit.display_name}) ${p.title} - ${p.url}`);
  });
}

// ------------------ MAIN --------------------
(async () => {
  console.log('🚀 Starting crypto/meme coin data fetch...');
//   await fetchTweets();
  await fetchReddit();
  console.log('🎯 Data fetch complete!');
})();
