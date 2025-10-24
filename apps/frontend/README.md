This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Backend API (Envio service) running or deployed

### Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set your values:
```bash
# Backend API URL (required)
NEXT_PUBLIC_ENVIO_API_URL=http://localhost:3001

# Twitter API Key (optional)
NEXT_PUBLIC_TWITTER_API_KEY=your_key_here

# Other variables use defaults
```

3. **Run the development server:**

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📦 Environment Variables

All hardcoded values have been moved to environment variables for production deployment. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Required Variables:
- `NEXT_PUBLIC_ENVIO_API_URL` - Backend API URL
- `NEXT_PUBLIC_TWITTER_API_KEY` - Twitter API key (optional)
- `NEXT_PUBLIC_ETHERSCAN_URL` - Etherscan URL (has default)
- `NEXT_PUBLIC_MORALIS_CHART_URL` - Moralis chart URL (has default)
- `NEXT_PUBLIC_TWITTER_API_URL` - Twitter API URL (has default)

## 🏗️ Project Structure

```
apps/frontend/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── erc20/             # ERC20 token pages
│   └── token/             # Individual token pages
├── components/            # React components
├── lib/                   # Utility functions
│   ├── env.ts            # Environment variable configuration
│   ├── utils.ts          # Helper functions
│   └── fetchtweets.ts    # Twitter integration
├── public/               # Static assets
├── .env.local.example    # Example environment variables
└── DEPLOYMENT.md         # Deployment guide
```

## 🚀 Deployment

For production deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

Quick deploy options:
- **Vercel** (recommended): One-click deploy
- **Netlify**: Easy static hosting
- **Docker**: Containerized deployment
- **VPS**: Traditional server deployment

## 🧪 Building for Production

```bash
npm run build
npm run start
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
