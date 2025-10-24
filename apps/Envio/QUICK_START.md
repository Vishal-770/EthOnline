# 🚀 Envio Backend - Quick Start Guide

## ✅ All Errors Fixed!

All TypeScript and linting errors have been resolved. The backend is now **production-ready** and **deployment-ready**.

## 📦 What Was Fixed

### 1. **TypeScript Errors** ✅
- ✅ Fixed null/undefined checks in `test.ts`
- ✅ Fixed optional chaining in `fetch-token-address.ts`
- ✅ Fixed return statements in `index.ts`
- ✅ Fixed median calculation in `aggregate.ts`
- ✅ Fixed time pattern analysis in `aggregate.ts`

### 2. **Environment Variables** ✅
- ✅ Moved all hardcoded values to `.env`
- ✅ Created `.env.example` template
- ✅ Added dotenv configuration to all files

### 3. **Production Configuration** ✅
- ✅ Updated `tsconfig.json` for proper builds
- ✅ Fixed import paths (removed `.ts` extensions)
- ✅ Added proper npm scripts
- ✅ Configured CORS with environment variable

### 4. **Deployment Files** ✅
- ✅ `Dockerfile` for containerization
- ✅ `docker-compose.yml` for easy deployment
- ✅ `Procfile` for Heroku
- ✅ `render.json` for Render.com
- ✅ `.gitignore` for security

## 🏃 Quick Start (Local Development)

### Step 1: Install Dependencies
```powershell
cd apps\Envio
npm install
```

### Step 2: Setup Environment
```powershell
# Copy the example environment file
Copy-Item .env.example .env

# Edit .env and add your tokens
notepad .env
```

Required variables:
```env
HYPERSYNC_BEARER_TOKEN=your_token_here
RPC_URL=https://eth.llamarpc.com
PORT=3001
```

### Step 3: Run Development Server
```powershell
npm run dev
```

The API will be available at `http://localhost:3001`

### Step 4: Test Endpoints
```powershell
# Health check
curl http://localhost:3001/

# Get token metadata
curl http://localhost:3001/token-metadata/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984

# Get token addresses
curl http://localhost:3001/token-addresses

# Get transactions
curl http://localhost:3001/transactions/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984
```

## 🏗️ Production Build

### Build TypeScript
```powershell
npm run build
```

### Start Production Server
```powershell
npm start
```

### Run Type Check
```powershell
npm run typecheck
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)
```powershell
docker-compose up -d
```

### Using Docker
```powershell
# Build
docker build -t envio-api .

# Run
docker run -p 3001:3001 --env-file .env envio-api
```

## ☁️ Cloud Deployment

### Railway
```powershell
npm install -g @railway/cli
railway login
railway init
railway variables set HYPERSYNC_BEARER_TOKEN=your_token
railway variables set RPC_URL=https://eth.llamarpc.com
railway up
```

### Render
1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Environment**: Add variables from `.env`
5. Click "Create Web Service"

### Heroku
```powershell
# Install Heroku CLI first
heroku login
heroku create your-app-name
heroku config:set HYPERSYNC_BEARER_TOKEN=your_token
heroku config:set RPC_URL=https://eth.llamarpc.com
git push heroku main
```

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/token-metadata/:address` | GET | Get comprehensive token analytics |
| `/token-addresses` | GET | Get list of tracked tokens |
| `/transactions/:address` | GET | Get all transactions for a token |

## 🔐 Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `HYPERSYNC_BEARER_TOKEN` | ✅ Yes | - | Your Hypersync API token |
| `HYPERSYNC_URL` | No | `https://eth.hypersync.xyz` | Hypersync API URL |
| `RPC_URL` | No | `https://eth.llamarpc.com` | Ethereum RPC endpoint |
| `PORT` | No | `3001` | Server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `CORS_ORIGIN` | No | `*` | CORS allowed origin |

## 🧪 Testing

```powershell
# Type checking
npm run typecheck

# Build test
npm run build

# Start server
npm start
```

## 📁 Project Structure

```
apps/Envio/
├── src/
│   ├── index.ts              # Main server
│   ├── test.ts               # Token metadata
│   ├── fetch-token-address.ts # Token discovery
│   ├── fetch-token-metadata.ts # Metadata utilities
│   ├── transaction.ts        # Transaction fetcher
│   └── aggregate.ts          # Analytics engine
├── dist/                     # Build output (generated)
├── .env                      # Environment variables (create this)
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
├── Dockerfile                # Docker configuration
├── docker-compose.yml        # Docker Compose config
├── Procfile                  # Heroku config
├── render.json               # Render.com config
├── package.json              # Dependencies & scripts
├── tsconfig.json             # TypeScript config
└── README.md                 # Documentation
```

## ✨ Available Scripts

```powershell
npm run dev        # Development with hot reload
npm run build      # Build TypeScript to JavaScript
npm start          # Start production server
npm run typecheck  # Run TypeScript type checking
npm run clean      # Clean build directory
```

## 🔍 Troubleshooting

### Port Already in Use
```powershell
# Change port in .env
echo "PORT=3002" >> .env
```

### TypeScript Errors
```powershell
# Run type check to see errors
npm run typecheck

# Clean and rebuild
npm run clean
npm run build
```

### Environment Variables Not Loading
```powershell
# Make sure .env file exists
dir .env

# Check if dotenv is installed
npm list dotenv
```

### Connection Errors
- Verify `HYPERSYNC_BEARER_TOKEN` is valid
- Check `RPC_URL` is accessible
- Test with curl: `curl https://eth.llamarpc.com`

## 📊 Status

```
✅ All TypeScript errors fixed
✅ All linting errors fixed
✅ Environment variables configured
✅ Deployment files created
✅ Docker support added
✅ Documentation complete
🚀 READY FOR DEPLOYMENT
```

## 🆘 Get Help

If you encounter any issues:
1. Check the logs: `npm run dev` shows detailed errors
2. Verify environment variables are set correctly
3. Ensure all dependencies are installed: `npm install`
4. Check the deployment checklist: `DEPLOYMENT_CHECKLIST.md`

---

**Next Steps:**
1. ✅ Install dependencies: `npm install`
2. ✅ Configure `.env` file
3. ✅ Test locally: `npm run dev`
4. ✅ Build for production: `npm run build`
5. ✅ Deploy to your platform
6. ✅ Update frontend to use your backend URL

**Your backend is now ready to deploy! 🎉**
