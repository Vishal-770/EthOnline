# Frontend Deployment Guide

This guide will help you deploy the EthOnline frontend application to production.

## 🔧 Environment Variables

The application requires the following environment variables. Copy `.env.example` to `.env` for local development or configure them in your deployment platform.

### Required Backend API Endpoints

```bash
# Envio On-Chain Analytics API (Port 3001)
# Local: http://localhost:3001
# Production: https://your-envio-api.com
NEXT_PUBLIC_ENVIO_API_URL=http://localhost:3001

# OffChain Social Analytics API (Port 3002)
# Local: http://localhost:3002
# Production: https://your-offchain-api.com
NEXT_PUBLIC_OFFCHAIN_API_URL=http://localhost:3002

# Agent/Assistant API (Port 3003)
# Local: http://localhost:3003
# Production: https://your-agent-api.com
NEXT_PUBLIC_AGENT_API_URL=http://localhost:3003

# Dashboard/Chat API (Port 4007)
# Local: http://localhost:4007
# Production: https://your-dashboard-api.com
NEXT_PUBLIC_DASHBOARD_API_URL=http://localhost:4007
```

### Blockchain Explorers (Optional - Defaults Provided)

```bash
NEXT_PUBLIC_ETHERSCAN_URL=https://etherscan.io
NEXT_PUBLIC_BASESCAN_URL=https://basescan.org
NEXT_PUBLIC_POLYGONSCAN_URL=https://polygonscan.com
NEXT_PUBLIC_ARBISCAN_URL=https://arbiscan.io
NEXT_PUBLIC_OPTIMISM_ETHERSCAN_URL=https://optimistic.etherscan.io
```

### Hypersync URLs (Optional - Defaults Provided)

```bash
NEXT_PUBLIC_HYPERSYNC_ETH=https://eth.hypersync.xyz
NEXT_PUBLIC_HYPERSYNC_BASE=https://base.hypersync.xyz
NEXT_PUBLIC_HYPERSYNC_POLYGON=https://polygon.hypersync.xyz
NEXT_PUBLIC_HYPERSYNC_ARBITRUM=https://arbitrum.hypersync.xyz
NEXT_PUBLIC_HYPERSYNC_OPTIMISM=https://optimism.hypersync.xyz
```

### External APIs (Optional)

```bash
# Twitter API
NEXT_PUBLIC_TWITTER_API_URL=https://api.twitterapi.io
NEXT_PUBLIC_TWITTER_API_KEY=your_twitter_api_key

# Moralis Chart Widget
NEXT_PUBLIC_MORALIS_CHART_URL=https://moralis.com/static/embed/chart.js

# ThirdWeb (for wallet connection)
NEXT_PUBLIC_THIRD_WEB_SECRET=your_secret
NEXT_PUBLIC_THIRD_WEB_CLIENT_ID=your_client_id

# WalletConnect
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id
```

### Setting Up Environment Variables

#### Local Development
```bash
cd apps/frontend
cp .env.example .env
# Edit .env with your local backend URLs (default: localhost)
```

#### Production Deployment
```bash
# Set all environment variables in your deployment platform
# Replace localhost URLs with your deployed backend service URLs
```

## 📦 Building for Production

### 1. Install Dependencies
```bash
# From the root of the monorepo
npm install
```

### 2. Set Environment Variables
Make sure all required environment variables are set in your `.env.production` or deployment platform.

### 3. Build the Application
```bash
cd apps/frontend
npm run build
```

### 4. Test Production Build Locally
```bash
npm run start
```

The application will be available at `http://localhost:3000`.

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)

1. **Push to GitHub/GitLab/Bitbucket**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Configure the project:
     - **Framework Preset**: Next.js
     - **Root Directory**: `apps/frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `.next`

3. **Set Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add all required variables:
     ```
     NEXT_PUBLIC_ENVIO_API_URL=https://your-backend-url.com
     NEXT_PUBLIC_TWITTER_API_KEY=your_key_here
     NEXT_PUBLIC_ETHERSCAN_URL=https://etherscan.io
     NEXT_PUBLIC_MORALIS_CHART_URL=https://moralis.com/static/embed/chart.js
     NEXT_PUBLIC_TWITTER_API_URL=https://api.twitterapi.io
     ```

4. **Deploy**
   - Click "Deploy"
   - Your app will be live at `your-project.vercel.app`

### Option 2: Netlify

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Build and Deploy**
   ```bash
   cd apps/frontend
   npm run build
   netlify deploy --prod --dir=.next
   ```

3. **Set Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add all required variables

### Option 3: Docker

1. **Create Dockerfile** (already included if present)
   ```dockerfile
   FROM node:18-alpine AS base

   FROM base AS deps
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci

   FROM base AS builder
   WORKDIR /app
   COPY --from=deps /app/node_modules ./node_modules
   COPY . .
   
   # Set environment variables for build
   ENV NEXT_PUBLIC_ENVIO_API_URL=${NEXT_PUBLIC_ENVIO_API_URL}
   ENV NEXT_PUBLIC_TWITTER_API_KEY=${NEXT_PUBLIC_TWITTER_API_KEY}
   ENV NEXT_PUBLIC_ETHERSCAN_URL=${NEXT_PUBLIC_ETHERSCAN_URL}
   ENV NEXT_PUBLIC_MORALIS_CHART_URL=${NEXT_PUBLIC_MORALIS_CHART_URL}
   ENV NEXT_PUBLIC_TWITTER_API_URL=${NEXT_PUBLIC_TWITTER_API_URL}
   
   RUN npm run build

   FROM base AS runner
   WORKDIR /app
   ENV NODE_ENV=production

   RUN addgroup --system --gid 1001 nodejs
   RUN adduser --system --uid 1001 nextjs

   COPY --from=builder /app/public ./public
   COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
   COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

   USER nextjs

   EXPOSE 3000

   ENV PORT=3000

   CMD ["node", "server.js"]
   ```

2. **Build Docker Image**
   ```bash
   docker build -t ethonline-frontend \
     --build-arg NEXT_PUBLIC_ENVIO_API_URL=https://your-backend.com \
     --build-arg NEXT_PUBLIC_TWITTER_API_KEY=your_key \
     .
   ```

3. **Run Docker Container**
   ```bash
   docker run -p 3000:3000 \
     -e NEXT_PUBLIC_ENVIO_API_URL=https://your-backend.com \
     -e NEXT_PUBLIC_TWITTER_API_KEY=your_key \
     ethonline-frontend
   ```

### Option 4: Traditional VPS (AWS EC2, DigitalOcean, etc.)

1. **Install Node.js on your server**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Clone your repository**
   ```bash
   git clone https://github.com/your-username/EthOnline.git
   cd EthOnline/apps/frontend
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set environment variables**
   ```bash
   nano .env.production
   # Add your variables
   ```

5. **Build the application**
   ```bash
   npm run build
   ```

6. **Start with PM2 (Process Manager)**
   ```bash
   sudo npm install -g pm2
   pm2 start npm --name "ethonline-frontend" -- start
   pm2 save
   pm2 startup
   ```

7. **Setup Nginx as reverse proxy**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🔒 Security Checklist

- [ ] All API keys are set as environment variables (not hardcoded)
- [ ] `.env.local` and `.env.production` are in `.gitignore`
- [ ] CORS is properly configured on backend API
- [ ] HTTPS is enabled (use Let's Encrypt for free SSL)
- [ ] Rate limiting is implemented on API endpoints
- [ ] Content Security Policy headers are configured

## 🧪 Testing Production Build

Before deploying, test your production build locally:

```bash
# Build the app
npm run build

# Start production server
npm run start

# Visit http://localhost:3000
# Test all features:
# - Token search and display
# - Transaction history
# - Price charts
# - External links (Etherscan)
```

## 📊 Monitoring and Analytics

Consider adding:
- **Error Tracking**: Sentry, LogRocket
- **Analytics**: Google Analytics, Plausible
- **Performance Monitoring**: Vercel Analytics, New Relic

## 🐛 Troubleshooting

### Build fails with "Environment variable not found"
- Ensure all required variables are set in your `.env.production` file
- Variables must start with `NEXT_PUBLIC_` to be accessible in the browser

### API calls fail in production
- Check that `NEXT_PUBLIC_ENVIO_API_URL` points to your production backend
- Verify CORS settings on your backend allow requests from your frontend domain
- Check browser console for specific error messages

### Styles look broken
- Run `npm run build` again to ensure all assets are properly compiled
- Check that Tailwind CSS is properly configured
- Clear browser cache and hard reload

## 📝 Environment Variable Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_ENVIO_API_URL` | Yes | `http://localhost:3001` | Backend API URL |
| `NEXT_PUBLIC_TWITTER_API_KEY` | No | - | Twitter API key for social features |
| `NEXT_PUBLIC_ETHERSCAN_URL` | No | `https://etherscan.io` | Etherscan base URL |
| `NEXT_PUBLIC_MORALIS_CHART_URL` | No | Provided | Moralis chart widget URL |
| `NEXT_PUBLIC_TWITTER_API_URL` | No | Provided | Twitter API base URL |

## 🔄 Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        working-directory: apps/frontend
        
      - name: Build
        run: npm run build
        working-directory: apps/frontend
        env:
          NEXT_PUBLIC_ENVIO_API_URL: ${{ secrets.NEXT_PUBLIC_ENVIO_API_URL }}
          NEXT_PUBLIC_TWITTER_API_KEY: ${{ secrets.NEXT_PUBLIC_TWITTER_API_KEY }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 📚 Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Deployment Guide](https://vercel.com/docs)
- [Environment Variables in Next.js](https://nextjs.org/docs/basic-features/environment-variables)

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the Next.js deployment logs
3. Open an issue on GitHub with:
   - Error messages
   - Environment details
   - Steps to reproduce
