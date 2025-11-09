# Quick Start Guide

Get the Financial Indices Tracker running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Alpha Vantage API key (get free at https://www.alphavantage.co/support/#api-key)

## Installation Steps

### 1. Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd web-app

# Install dependencies
npm install
```

### 2. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your API key
# ALPHA_VANTAGE_API_KEY=your_actual_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

### 4. Open Browser

Navigate to [http://localhost:3000](http://localhost:3000)

## That's It! 🎉

You should now see the Financial Indices Tracker running with:
- List of major market indices
- Real-time WebSocket connection
- Rate limit indicators
- Interactive UI

## Next Steps

1. **Click an index** to view 30-day historical data
2. **Watch the console** to see caching in action
3. **Monitor rate limits** in the UI indicator
4. **Wait for WebSocket updates** (every 2 minutes)

## Common Issues

### "ALPHA_VANTAGE_API_KEY is not configured"

**Solution**: Make sure you created `.env` file and added your API key.

### Port 3000 already in use

**Solution**: 
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### WebSocket not connecting

**Solution**: Make sure you're using the custom server:
```bash
node server.js
```

## Demo Mode

Want to try without an API key? Use the demo key:

```env
ALPHA_VANTAGE_API_KEY=demo
```

**Note**: Demo key has limited functionality and may return sample data.

## Production Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

Quick deploy to Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

## Need Help?

- 📖 Read the full [README.md](./README.md)
- 🏗️ Check [ARCHITECTURE.md](./ARCHITECTURE.md)
- 🚀 See [DEPLOYMENT.md](./DEPLOYMENT.md)
- 🐛 Open an issue on GitHub

Happy tracking! 📈

