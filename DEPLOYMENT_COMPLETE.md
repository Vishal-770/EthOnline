# 🚀 Complete Deployment Checklist

## ✅ What's Been Configured

### 1. **OffChain Service** (apps/OffChain)
- ✅ All hardcoded credentials moved to environment variables
- ✅ `.env` file configured with Redis, Twitter, Reddit, AI APIs
- ✅ `.env.example` created with all required variables
- ✅ Fixed `GOOGLE_API_KEY` → `GEMINI_API_KEY` (correct env var name)
- ✅ TypeScript build scripts added (build, build:clean, prod)
- ✅ Dockerfile created for containerized deployment
- ✅ Procfile added for Heroku/Render deployment
- ✅ DEPLOYMENT.md guide created
- ✅ `.gitignore` configured

**Port:** 3002  
**Health Check:** `GET /`

### 2. **Envio Service** (apps/Envio)
- ✅ All RPC URLs moved to environment variables
- ✅ Redis credentials secured in `.env`
- ✅ Fixed JsonRpcProvider network detection errors (added staticNetwork)
- ✅ TypeScript build scripts configured
- ✅ `.env.example` created
- ✅ Console.log statements removed

**Port:** 3001  
**Health Check:** `GET /`

### 3. **Frontend** (apps/frontend)
- ✅ All localhost URLs moved to environment variables
- ✅ 4 backend API endpoints configured:
  - `NEXT_PUBLIC_ENVIO_API_URL` (Port 3001)
  - `NEXT_PUBLIC_OFFCHAIN_API_URL` (Port 3002)
  - `NEXT_PUBLIC_AGENT_API_URL` (Port 3003)
  - `NEXT_PUBLIC_DASHBOARD_API_URL` (Port 4007)
- ✅ All blockchain explorer URLs configurable
- ✅ All Hypersync URLs configurable
- ✅ Updated components:
  - ChatInterface.tsx
  - TrendingEthereumToken.tsx
  - DashboardSidebar.tsx
  - AppSideBar.tsx
  - analyze/page.tsx
  - agent/page.tsx
  - TrendingTokens.tsx
  - lib/chains.ts
- ✅ `.env.example` comprehensive template created
- ✅ DEPLOYMENT.md updated with all new variables

**Build Command:** `npm run build`  
**Start Command:** `npm start`

---

## 📋 Environment Variables Summary

### OffChain (.env)
```bash
PORT=3002
NODE_ENV=production
REDIS_USERNAME=default
REDIS_PASSWORD=***
REDIS_HOST=***
REDIS_PORT=13615
TWITTER_BEARER_TOKEN=***
REDDIT_CLIENT_ID=***
REDDIT_CLIENT_SECRET=***
REDDIT_USER_AGENT=***
REDDIT_USERNAME=***
REDDIT_PASSWORD=***
GEMINI_API_KEY=***
OPENAI_API_KEY=***
```

### Envio (.env)
```bash
PORT=3001
NODE_ENV=production
REDIS_USERNAME=default
REDIS_PASSWORD=***
REDIS_HOST=***
REDIS_PORT=13615
HYPERSYNC_BEARER_TOKEN=***
ETH_RPC_URL=https://eth.llamarpc.com
ARB_RPC_URL=https://arb1.arbitrum.io/rpc
BASE_RPC_URL=https://mainnet.base.org
OP_RPC_URL=https://mainnet.optimism.io
POLYGON_RPC_URL=https://polygon-rpc.com
BSC_RPC_URL=https://bsc-dataseed.binance.org
```

### Frontend (.env)
```bash
# Backend APIs
NEXT_PUBLIC_ENVIO_API_URL=http://localhost:3001
NEXT_PUBLIC_OFFCHAIN_API_URL=http://localhost:3002
NEXT_PUBLIC_AGENT_API_URL=http://localhost:3003
NEXT_PUBLIC_DASHBOARD_API_URL=http://localhost:4007

# Blockchain Explorers
NEXT_PUBLIC_ETHERSCAN_URL=https://etherscan.io
NEXT_PUBLIC_BASESCAN_URL=https://basescan.org
NEXT_PUBLIC_POLYGONSCAN_URL=https://polygonscan.com
NEXT_PUBLIC_ARBISCAN_URL=https://arbiscan.io
NEXT_PUBLIC_OPTIMISM_ETHERSCAN_URL=https://optimistic.etherscan.io

# Hypersync
NEXT_PUBLIC_HYPERSYNC_ETH=https://eth.hypersync.xyz
NEXT_PUBLIC_HYPERSYNC_BASE=https://base.hypersync.xyz
NEXT_PUBLIC_HYPERSYNC_POLYGON=https://polygon.hypersync.xyz
NEXT_PUBLIC_HYPERSYNC_ARBITRUM=https://arbitrum.hypersync.xyz
NEXT_PUBLIC_HYPERSYNC_OPTIMISM=https://optimism.hypersync.xyz

# External APIs
NEXT_PUBLIC_TWITTER_API_KEY=***
NEXT_PUBLIC_THIRD_WEB_SECRET=***
NEXT_PUBLIC_THIRD_WEB_CLIENT_ID=***
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=***
```

---

## 🚀 Deployment Steps

### Option 1: Deploy to Vercel (Frontend)

#### Frontend
```bash
cd apps/frontend
# Push to GitHub
# Connect repository to Vercel
# Add environment variables in Vercel dashboard
# Deploy
```

**Vercel Environment Variables:**
- Go to Project Settings → Environment Variables
- Add all `NEXT_PUBLIC_*` variables
- **Important:** Set production URLs for backend services!

### Option 2: Deploy to Render.com (Backend Services)

#### OffChain Service
1. Create New Web Service
2. Connect GitHub repo
3. Root Directory: `apps/OffChain`
4. Build Command: `npm install && npm run build`
5. Start Command: `npm start`
6. Add environment variables from `.env.example`

#### Envio Service
1. Create New Web Service
2. Connect GitHub repo
3. Root Directory: `apps/Envio`
4. Build Command: `npm install && npm run build`
5. Start Command: `npm start`
6. Add environment variables from `.env.example`

### Option 3: Docker Deployment

#### OffChain
```bash
cd apps/OffChain
docker build -t offchain-api .
docker run -p 3002:3002 --env-file .env offchain-api
```

#### Envio
```bash
cd apps/Envio
docker build -t envio-api .
docker run -p 3001:3001 --env-file .env envio-api
```

---

## 🔄 Post-Deployment Configuration

### 1. Update Frontend Environment Variables
After deploying backend services, update frontend `.env`:
```bash
NEXT_PUBLIC_ENVIO_API_URL=https://your-envio-api.onrender.com
NEXT_PUBLIC_OFFCHAIN_API_URL=https://your-offchain-api.onrender.com
```

### 2. Update CORS Settings
In backend services, update CORS to allow your frontend domain:
```typescript
// Envio/OffChain index.ts
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*'
}));
```

Add to `.env`:
```bash
CORS_ORIGIN=https://your-frontend.vercel.app
```

### 3. Test Endpoints

#### OffChain
```bash
curl https://your-offchain-api.com/
# Response: "OffChain API is running"

curl https://your-offchain-api.com/top-tokens?limit=10
```

#### Envio
```bash
curl https://your-envio-api.com/
# Response: "Envio API is running"

curl https://your-envio-api.com/analyze-wallets/0x...
```

#### Frontend
```bash
curl https://your-frontend.vercel.app/
# Should load successfully
```

---

## 🔍 Monitoring & Health Checks

### Health Check Endpoints

| Service | Endpoint | Expected Response |
|---------|----------|-------------------|
| OffChain | `GET /` | "OffChain API is running" |
| Envio | `GET /` | "Envio API is running" |
| Frontend | `GET /` | HTML page loads |

### Common Issues

#### 1. Frontend can't connect to backend
- ✅ Check `NEXT_PUBLIC_*` environment variables
- ✅ Verify backend URLs are correct (no trailing slashes)
- ✅ Check CORS settings in backend

#### 2. Backend API errors
- ✅ Verify all environment variables are set
- ✅ Check Redis connection (REDIS_HOST, REDIS_PASSWORD)
- ✅ Verify API keys (Twitter, Reddit, Gemini)

#### 3. RPC Provider errors
- ✅ Check RPC URLs in Envio `.env`
- ✅ Verify staticNetwork configuration
- ✅ Consider using paid RPC providers for production

---

## 📚 Documentation Files

- **OffChain:** `apps/OffChain/DEPLOYMENT.md`
- **Envio:** `apps/Envio/.env.example`
- **Frontend:** `apps/frontend/DEPLOYMENT.md`
- **This File:** Root deployment checklist

---

## ✅ Pre-Deployment Checklist

- [ ] All `.env` files configured
- [ ] `.gitignore` prevents committing `.env` files
- [ ] Build succeeds locally: `npm run build`
- [ ] Start succeeds locally: `npm start`
- [ ] All API keys valid and active
- [ ] Redis instance accessible
- [ ] RPC URLs tested and working
- [ ] Frontend connects to local backend
- [ ] No console.log statements in production code
- [ ] TypeScript compiles without errors
- [ ] All dependencies installed

---

## 🎉 Success Criteria

Your deployment is successful when:
1. ✅ OffChain API responds at `/top-tokens`
2. ✅ Envio API responds at `/analyze-wallets`
3. ✅ Frontend loads and connects to backend
4. ✅ Wallet analysis works end-to-end
5. ✅ Social media data displays on frontend
6. ✅ No CORS errors in browser console
7. ✅ No connection errors in logs

---

**Last Updated:** October 26, 2025  
**Status:** ✅ All services ready for deployment
