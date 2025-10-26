# OffChain Social Analytics - Deployment Guide

## Overview
OffChain is a social media analytics aggregation service that fetches and analyzes social sentiment for cryptocurrency tokens. It integrates with Twitter, Reddit, and AI services (Gemini, OpenAI) to provide comprehensive social analytics.

## Prerequisites
- Node.js 18.0.0 or higher
- Redis instance (cloud or local)
- Twitter API Bearer Token
- Reddit API credentials
- Google Gemini API key
- OpenAI API key (optional)

## Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

### Required Variables

#### Server Configuration
- `PORT` - Server port (default: 3002)
- `NODE_ENV` - Environment (development/production)

#### Redis Configuration
- `REDIS_USERNAME` - Redis username (default: "default")
- `REDIS_PASSWORD` - Redis password
- `REDIS_HOST` - Redis host URL
- `REDIS_PORT` - Redis port (default: 6379)

#### Twitter API
- `TWITTER_BEARER_TOKEN` - Twitter API v2 Bearer token
  - Get from: https://developer.twitter.com/en/portal/dashboard

#### Reddit API
- `REDDIT_CLIENT_ID` - Reddit app client ID
- `REDDIT_CLIENT_SECRET` - Reddit app client secret
- `REDDIT_USER_AGENT` - User agent string (e.g., "Crypto Data Fetcher")
- `REDDIT_USERNAME` - Reddit username
- `REDDIT_PASSWORD` - Reddit password
  - Get from: https://www.reddit.com/prefs/apps

#### AI APIs
- `GEMINI_API_KEY` - Google Gemini API key (required for sentiment analysis)
  - Get from: https://makersuite.google.com/app/apikey
- `OPENAI_API_KEY` - OpenAI API key (optional, fallback)
  - Get from: https://platform.openai.com/api-keys

## Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Run Development Server
```bash
npm run dev
```

The server will start on http://localhost:3002 with hot-reload enabled.

### 4. Build for Production
```bash
npm run build
```

### 5. Run Production Build
```bash
npm start
```

## Deployment Options

### Deploy to Render.com

1. **Create New Web Service**
   - Connect your GitHub repository
   - Select the `apps/OffChain` folder as root directory

2. **Configure Build Settings**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment: Node

3. **Add Environment Variables**
   - Go to Environment tab
   - Add all variables from `.env.example`
   - Set `NODE_ENV=production`

4. **Deploy**
   - Render will automatically deploy on push to main branch

### Deploy to Railway.app

1. **Create New Project**
   - Import from GitHub
   - Select repository

2. **Configure Service**
   - Root Directory: `apps/OffChain`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

3. **Add Environment Variables**
   - Go to Variables tab
   - Import from `.env` or add manually

4. **Deploy**
   - Railway will automatically build and deploy

### Deploy to Heroku

1. **Prerequisites**
```bash
# Install Heroku CLI
# Login to Heroku
heroku login
```

2. **Create Heroku App**
```bash
cd apps/OffChain
heroku create your-offchain-app
```

3. **Configure Buildpack**
```bash
heroku buildpacks:set heroku/nodejs
```

4. **Set Environment Variables**
```bash
heroku config:set PORT=3002
heroku config:set NODE_ENV=production
heroku config:set REDIS_USERNAME=your_username
heroku config:set REDIS_PASSWORD=your_password
heroku config:set REDIS_HOST=your_host
heroku config:set REDIS_PORT=6379
heroku config:set TWITTER_BEARER_TOKEN=your_token
heroku config:set REDDIT_CLIENT_ID=your_id
heroku config:set REDDIT_CLIENT_SECRET=your_secret
heroku config:set REDDIT_USER_AGENT="Your App Name"
heroku config:set REDDIT_USERNAME=your_username
heroku config:set REDDIT_PASSWORD=your_password
heroku config:set GEMINI_API_KEY=your_key
heroku config:set OPENAI_API_KEY=your_key
```

5. **Deploy**
```bash
git push heroku main
```

### Deploy to DigitalOcean App Platform

1. **Create New App**
   - Connect GitHub repository
   - Select `apps/OffChain` as source directory

2. **Configure Component**
   - Type: Web Service
   - Build Command: `npm install && npm run build`
   - Run Command: `npm start`
   - HTTP Port: 3002

3. **Add Environment Variables**
   - Go to Settings > Environment Variables
   - Add all required variables

4. **Deploy**
   - Click "Create Resources"

### Deploy with Docker

1. **Create Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3002

CMD ["npm", "start"]
```

2. **Build and Run**
```bash
docker build -t offchain-api .
docker run -p 3002:3002 --env-file .env offchain-api
```

## API Endpoints

### Health Check
```
GET /
```

### Get All Social Posts
```
GET /allposts
```

### Get Token-Specific Posts
```
POST /tokenpost
Body: {
  "memeCoins": ["BTC", "ETH"],
  "cryptoTerms": ["moon", "pump"],
  "subreddits": ["CryptoCurrency"]
}
```

### Analyze Social Media Data
```
POST /social-analytics
Body: {
  "memeCoins": ["DOGE", "SHIB"],
  "cryptoTerms": ["meme coin", "crypto"],
  "subreddits": ["SatoshiStreetBets"]
}
```

### Update Social Scores
```
POST /update-social-scores
Body: {
  "startRank": 0,
  "endRank": 50
}
```

### Get Token Data
```
GET /token/:address
```

### Get Top Tokens
```
GET /top-tokens?limit=50
```

### Clear Cache
```
POST /clear-cache
```

## Automated Updates

The service automatically updates social scores for tokens in Redis:
- **Top 20 tokens**: Every 5 minutes
- **Tokens 20-100**: Every 20 minutes
- **Tokens 100+**: Every 30 minutes

## Redis Data Structure

Token data is stored with the token address as the key:
```json
{
  "address": "0x...",
  "name": "Token Name",
  "symbol": "TKN",
  "trendingscore": 85,
  "socialScore": 72,
  "finalScore": 79,
  "socialAnalysis": {
    "sentiment": "bullish",
    "sentimentScore": 0.75,
    "mentionCount": 150,
    "riskLevel": "medium",
    "recommendation": "buy",
    "confidence": 0.82,
    "lastUpdated": "2025-10-26T..."
  }
}
```

## Monitoring

### Health Checks
Monitor the root endpoint (`/`) for uptime:
```bash
curl https://your-app.com/
# Response: "OffChain API is running"
```

### Logs
Check logs for errors:
```bash
# Heroku
heroku logs --tail

# Render
# View in dashboard

# Docker
docker logs <container-id>
```

### Redis Connection
Monitor Redis connection errors in logs. The service will continue running even if Redis is temporarily unavailable.

## Troubleshooting

### Twitter API Errors
- Verify bearer token is valid
- Check rate limits (900 requests per 15 minutes)
- Ensure API v2 access is enabled

### Reddit API Errors
- Verify credentials are correct
- Check rate limits (60 requests per minute)
- Ensure user agent is descriptive

### Gemini API Errors
- Verify API key is active
- Check quota limits
- Monitor response times

### Redis Connection Issues
- Verify Redis host and port
- Check firewall rules
- Verify credentials

### Build Errors
```bash
# Clear cache and rebuild
npm run clean
npm install
npm run build
```

## Security Best Practices

1. **Never commit `.env` files**
   - Already in `.gitignore`

2. **Use environment variables**
   - All sensitive data in environment variables

3. **Rotate API keys regularly**
   - Update keys every 90 days

4. **Monitor API usage**
   - Set up alerts for unusual activity

5. **Use HTTPS in production**
   - Enable SSL/TLS on your deployment platform

## Performance Optimization

1. **Redis Caching**
   - Token rankings cached for 2 minutes
   - Reduces database queries

2. **Batch Updates**
   - Processes tokens in rank-based batches
   - Optimizes API usage

3. **Rate Limiting**
   - Respects Twitter/Reddit rate limits
   - Implements exponential backoff

## Support

For issues or questions:
- Check logs for error messages
- Verify all environment variables are set
- Ensure external services (Twitter, Reddit, Redis) are accessible
- Review API quotas and rate limits

## License

ISC
