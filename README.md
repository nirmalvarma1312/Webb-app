# Financial Indices Tracker

A modern web application for tracking financial indices and indicators with real-time updates, 30-day historical views, and intelligent caching.

![Financial Indices Tracker](https://img.shields.io/badge/Next.js-14.2-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

## 🚀 Features

- **Real-time Updates**: WebSocket integration for live market data updates every 2 minutes
- **30-Day Historical Views**: Interactive charts showing price trends and historical data
- **Smart Caching**: In-memory caching with configurable TTL to minimize API calls
- **Rate Limiting**: Respects API limits (20 requests/minute, 500 requests/month)
- **Server-Side API Routes**: Secure API key management and data fetching
- **Responsive Design**: Beautiful UI built with Tailwind CSS
- **Type-Safe**: Full TypeScript implementation

## 📊 Tracked Indices

- **SPY** - S&P 500 ETF
- **DIA** - Dow Jones ETF
- **QQQ** - NASDAQ-100 ETF
- **IWM** - Russell 2000 ETF
- **VTI** - Total Stock Market ETF

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **WebSocket**: ws library
- **API**: Alpha Vantage Financial API
- **Deployment**: Vercel (recommended)
DEPLOYMENT LINK: https://webb-app-5akg.vercel.app/

### Project Structure

```
web-app/
├── components/          # React components
│   ├── Chart.tsx       # 30-day historical chart
│   ├── IndexCard.tsx   # Index summary card
│   ├── RateLimitIndicator.tsx
│   └── WebSocketStatus.tsx
├── lib/                # Core utilities
│   ├── api-service.ts  # API integration layer
│   ├── cache.ts        # In-memory caching
│   ├── rate-limiter.ts # Rate limiting logic
│   └── types.ts        # TypeScript definitions
├── pages/              # Next.js pages
│   ├── api/            # API routes
│   │   ├── indices/    # Index data endpoints
│   │   └── cache/      # Cache statistics
│   ├── index/          # Detail pages
│   └── index.tsx       # Home page
├── server.js           # Custom server with WebSocket
└── styles/             # Global styles
```

## 🔧 Environment Setup

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn
- Alpha Vantage API key (free tier available)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd web-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys:

```env
# Required: Alpha Vantage API Key
# Get yours at: https://www.alphavantage.co/support/#api-key
ALPHA_VANTAGE_API_KEY=910P9BKYACXHH9BI

# Optional: Cache Configuration
CACHE_TTL_SECONDS=60
MIN_REFRESH_INTERVAL_SECONDS=60

# Optional: Rate Limiting
MAX_REQUESTS_PER_MINUTE=20
MAX_REQUESTS_PER_MONTH=500

# Optional: WebSocket URL (auto-configured)
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📦 Caching Strategy

### Overview

The application implements a multi-layered caching strategy to optimize API usage and respect rate limits:

### 1. In-Memory Cache

**Location**: `lib/cache.ts`

**Strategy**:
- TTL-based expiration (default: 60 seconds)
- Automatic cleanup of expired entries every 5 minutes
- Separate cache keys for quotes and historical data

**Benefits**:
- Reduces API calls by up to 90%
- Instant response for cached data
- Configurable TTL per data type

**Implementation**:
```typescript
// Quote data: 60 seconds TTL
cache.set(`quote:${symbol}`, data, 60);

// Historical data: 300 seconds TTL (5 minutes)
cache.set(`historical:${symbol}`, data, 300);
```

### 2. Rate Limiting

**Location**: `lib/rate-limiter.ts`

**Strategy**:
- Tracks requests per minute and per month
- Prevents API calls when limits are reached
- Automatic reset after time windows expire

**Limits**:
- 20 requests per minute
- 500 requests per month

**Implementation**:
```typescript
// Check before making request
const { allowed, reason, retryAfter } = rateLimiter.canMakeRequest();
if (!allowed) {
  throw new Error(reason);
}

// Record successful request
rateLimiter.recordRequest();
```

### 3. Request Deduplication

**Strategy**:
- Cache checks before API calls
- Sequential fetching with delays between requests
- WebSocket updates reduce manual refresh needs

**Benefits**:
- Prevents duplicate requests for same data
- Spreads API calls over time
- Maintains data freshness

### 4. Cache Statistics

Monitor cache performance at `/api/cache/stats`:

```json
{
  "success": true,
  "data": {
    "totalEntries": 10,
    "validEntries": 8,
    "expiredEntries": 2,
    "rateLimit": {
      "minuteUsage": 5,
      "minuteLimit": 20,
      "monthUsage": 127,
      "monthLimit": 500
    }
  }
}
```

## 🔌 WebSocket Implementation

### Connection

The WebSocket server runs on the same port as the Next.js app:

```javascript
// Client connection
const ws = new WebSocket('ws://localhost:3000/api/ws');

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.type === 'update') {
    // Handle real-time update
  }
};
```

### Message Types

1. **Connected**: Initial connection confirmation
2. **Update**: Market data updates (every 2 minutes)
3. **Heartbeat**: Keep-alive ping (every 30 seconds)
4. **Error**: Error notifications

### Auto-Reconnection

The client automatically reconnects if the connection drops:

```typescript
ws.onclose = () => {
  setTimeout(() => connect(), 5000); // Retry after 5 seconds
};
```

## 🚀 Deployment

### Vercel (Recommended)

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Deploy**:
```bash
vercel
```

3. **Configure Environment Variables**:
   - Go to your Vercel dashboard
   - Navigate to Settings > Environment Variables
   - Add `ALPHA_VANTAGE_API_KEY` and other variables

4. **Production Deployment**:
```bash
vercel --prod
```

### Alternative: Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t financial-tracker .
docker run -p 3000:3000 --env-file .env financial-tracker
```

## 📊 API Endpoints

### GET /api/indices

Returns all tracked indices.

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "symbol": "SPY",
      "name": "S&P 500 ETF",
      "value": 450.25,
      "change": 2.35,
      "changePercent": 0.52,
      "timestamp": "2024-01-15"
    }
  ],
  "rateLimit": { ... }
}
```

### GET /api/indices/[symbol]

Returns detailed data for a specific index including 30-day history.

**Response**:
```json
{
  "success": true,
  "data": {
    "symbol": "SPY",
    "name": "S&P 500 ETF",
    "currentValue": 450.25,
    "change": 2.35,
    "changePercent": 0.52,
    "timestamp": "2024-01-15",
    "historicalData": [
      {
        "date": "2024-01-15",
        "open": 448.50,
        "high": 451.00,
        "low": 447.80,
        "close": 450.25,
        "volume": 75000000
      }
    ]
  }
}
```

### GET /api/cache/stats

Returns cache and rate limit statistics.

## 🧪 Testing

### Manual Testing

1. **Test Caching**:
   - Load the home page
   - Check browser console for cache hits
   - Refresh within 60 seconds to see cached data

2. **Test Rate Limiting**:
   - Monitor the rate limit indicator
   - Make multiple rapid requests
   - Verify rate limit enforcement

3. **Test WebSocket**:
   - Open browser console
   - Watch for WebSocket connection messages
   - Verify updates every 2 minutes

### Load Testing

```bash
# Install Apache Bench
brew install apache2

# Test API endpoint
ab -n 100 -c 10 http://localhost:3000/api/indices
```

## 📈 Performance Optimizations

1. **Code Splitting**: Next.js automatic code splitting
2. **Image Optimization**: Next.js Image component (if images added)
3. **Caching**: Multi-layer caching strategy
4. **Lazy Loading**: Components loaded on demand
5. **Memoization**: React.memo for expensive components

## 🔒 Security

- API keys stored in environment variables
- Server-side API calls only
- Rate limiting prevents abuse
- CORS configured for production
- Input validation on all endpoints

## 🐛 Troubleshooting

### API Key Issues

**Problem**: "ALPHA_VANTAGE_API_KEY is not configured"

**Solution**: 
1. Verify `.env` file exists
2. Check API key is valid
3. Restart development server

### WebSocket Connection Failed

**Problem**: WebSocket not connecting

**Solution**:
1. Ensure custom server is running (`node server.js`)
2. Check firewall settings
3. Verify port 3000 is not in use

### Rate Limit Exceeded

**Problem**: "Rate limit exceeded" errors

**Solution**:
1. Wait for rate limit window to reset
2. Reduce refresh frequency
3. Rely on cached data
4. Consider upgrading API plan

## 📝 License

MIT License - feel free to use this project for learning and development.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Built by Nirmal Vegesna using Next.js and TypeScript**

