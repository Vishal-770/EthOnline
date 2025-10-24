#!/bin/bash
# Quick Setup Script for Linux/Mac
# Run this script from the apps/frontend directory

echo "====================================="
echo "EthOnline Frontend Setup"
echo "====================================="
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "✓ .env.local already exists"
    read -p "Do you want to overwrite it? (y/N): " overwrite
    if [ "$overwrite" != "y" ]; then
        echo "Keeping existing .env.local"
        exit 0
    fi
fi

# Copy example file
if [ -f ".env.local.example" ]; then
    cp .env.local.example .env.local
    echo "✓ Created .env.local from example"
else
    echo "✗ .env.local.example not found!"
    exit 1
fi

echo ""
echo "====================================="
echo "Environment Configuration"
echo "====================================="
echo ""

# Prompt for backend URL
echo "Backend API Configuration:"
read -p "Enter your backend API URL (default: http://localhost:3001): " backend_url
backend_url=${backend_url:-http://localhost:3001}

# Prompt for Twitter API key (optional)
echo ""
echo "Twitter Integration (Optional):"
read -p "Enter Twitter API Key (press Enter to skip): " twitter_key

# Update .env.local using sed
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s|NEXT_PUBLIC_ENVIO_API_URL=.*|NEXT_PUBLIC_ENVIO_API_URL=$backend_url|g" .env.local
    if [ -n "$twitter_key" ]; then
        sed -i '' "s|NEXT_PUBLIC_TWITTER_API_KEY=.*|NEXT_PUBLIC_TWITTER_API_KEY=$twitter_key|g" .env.local
    fi
else
    # Linux
    sed -i "s|NEXT_PUBLIC_ENVIO_API_URL=.*|NEXT_PUBLIC_ENVIO_API_URL=$backend_url|g" .env.local
    if [ -n "$twitter_key" ]; then
        sed -i "s|NEXT_PUBLIC_TWITTER_API_KEY=.*|NEXT_PUBLIC_TWITTER_API_KEY=$twitter_key|g" .env.local
    fi
fi

echo ""
echo "====================================="
echo "✓ Setup Complete!"
echo "====================================="
echo ""
echo "Your configuration:"
echo "  Backend API: $backend_url"
if [ -n "$twitter_key" ]; then
    echo "  Twitter API: Configured"
else
    echo "  Twitter API: Not configured (optional)"
fi
echo ""
echo "Next steps:"
echo "  1. Install dependencies: npm install"
echo "  2. Run development server: npm run dev"
echo "  3. Open http://localhost:3000"
echo ""
echo "For deployment instructions, see DEPLOYMENT.md"
echo ""
