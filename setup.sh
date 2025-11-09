#!/bin/bash

# Financial Indices Tracker - Setup Script
# This script automates the initial setup process

set -e  # Exit on error

echo "🚀 Financial Indices Tracker - Setup Script"
echo "==========================================="
echo ""

# Check Node.js version
echo "📦 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)

if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18 or higher is required"
    echo "   Current version: $(node -v)"
    echo "   Please upgrade Node.js: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Check if .env exists
echo "🔐 Checking environment configuration..."
if [ ! -f .env ]; then
    echo "⚠️  .env file not found"
    echo "📝 Creating .env from .env.example..."
    
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ .env file created"
        echo ""
        echo "⚠️  IMPORTANT: Please edit .env and add your API keys:"
        echo "   1. Get Alpha Vantage API key: https://www.alphavantage.co/support/#api-key"
        echo "   2. Edit .env file: nano .env"
        echo "   3. Replace 'your_api_key_here' with your actual key"
        echo ""
        read -p "Press Enter after you've added your API key..."
    else
        echo "❌ Error: .env.example not found"
        exit 1
    fi
else
    echo "✅ .env file exists"
fi
echo ""

# Check if API key is configured
echo "🔑 Validating API key..."
if grep -q "your_api_key_here" .env || grep -q "demo" .env; then
    echo "⚠️  Warning: Using demo/placeholder API key"
    echo "   For full functionality, add your Alpha Vantage API key to .env"
else
    echo "✅ API key configured"
fi
echo ""

# Install dependencies
echo "📚 Installing dependencies..."
if [ -d "node_modules" ]; then
    echo "   node_modules exists, checking for updates..."
    npm install
else
    echo "   Installing fresh dependencies..."
    npm install
fi
echo "✅ Dependencies installed"
echo ""

# Type checking
echo "🔍 Running type check..."
npm run type-check
echo "✅ Type check passed"
echo ""

# Build test
echo "🏗️  Testing production build..."
npm run build
echo "✅ Build successful"
echo ""

# Success message
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Start development server:"
echo "     npm run dev"
echo ""
echo "  2. Open browser:"
echo "     http://localhost:3000"
echo ""
echo "  3. For production:"
echo "     npm start"
echo ""
echo "📚 Documentation:"
echo "  - Quick Start: QUICKSTART.md"
echo "  - Full README: README.md"
echo "  - API Docs: API_DOCUMENTATION.md"
echo "  - Deployment: DEPLOYMENT.md"
echo ""
echo "Happy tracking! 📈"

