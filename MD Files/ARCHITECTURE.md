# Architecture Documentation

## System Overview

The Financial Indices Tracker is a full-stack Next.js application that provides real-time financial market data with intelligent caching and rate limiting.

```
┌─────────────────────────────────────────────────────────────┐
│                         Client (Browser)                     │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Home Page  │  │ Detail Page  │  │ WebSocket Client │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Server (Node.js)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   API Routes                          │   │
│  │  • /api/indices          (list all)                  │   │
│  │  • /api/indices/[symbol] (detail view)               │   │
│  │  • /api/cache/stats      (statistics)                │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Core Services Layer                      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌─────────────────┐    │   │
│  │  │  Cache   │  │   Rate   │  │  API Service    │    │   │
│  │  │  Manager │  │  Limiter │  │  (Alpha Vantage)│    │   │
│  │  └──────────┘  └──────────┘  └─────────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              WebSocket Server                         │   │
│  │  • Real-time updates every 2 minutes                 │   │
│  │  • Heartbeat mechanism                               │   │
│  │  • Auto-reconnection support                         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Alpha Vantage API                           │
│  • Global Quote API                                          │
│  • Time Series Daily API                                     │
│  • Rate Limits: 20 req/min, 500 req/month                   │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Components

```
components/
├── IndexCard.tsx           # Displays individual index summary
├── Chart.tsx              # 30-day historical chart (Recharts)
├── RateLimitIndicator.tsx # Shows API usage statistics
└── WebSocketStatus.tsx    # Connection status indicator
```

### Pages Structure

```
pages/
├── _app.tsx              # Global app wrapper
├── _document.tsx         # HTML document structure
├── index.tsx             # Home page (list view)
├── index/
│   └── [symbol].tsx      # Detail page (30-day view)
└── api/
    ├── indices/
    │   ├── index.ts      # GET all indices
    │   └── [symbol].ts   # GET specific index detail
    └── cache/
        └── stats.ts      # GET cache statistics
```

## Data Flow

### 1. Initial Page Load

```
User Request
    ↓
Next.js SSR
    ↓
Fetch from /api/indices
    ↓
Check Cache ──→ Cache Hit? ──→ Return Cached Data
    ↓ (Cache Miss)
Check Rate Limit ──→ Exceeded? ──→ Return Error
    ↓ (Within Limit)
Call Alpha Vantage API
    ↓
Store in Cache
    ↓
Record Rate Limit Usage
    ↓
Return Data to Client
```

### 2. WebSocket Updates

```
WebSocket Connection Established
    ↓
Server: Start Broadcast Timer (2 min)
    ↓
Timer Triggers
    ↓
Fetch Latest Data (uses cache)
    ↓
Broadcast to All Connected Clients
    ↓
Client: Update UI
    ↓
Repeat
```

### 3. Detail View Request

```
User Clicks Index Card
    ↓
Navigate to /index/[symbol]
    ↓
Fetch from /api/indices/[symbol]
    ↓
Parallel Requests:
    ├─→ Get Current Quote (cache: 60s)
    └─→ Get Historical Data (cache: 300s)
    ↓
Merge Results
    ↓
Render Chart + Table
```

## Caching Architecture

### Cache Structure

```typescript
interface CacheEntry<T> {
  data: T;              // Cached data
  timestamp: number;    // When cached
  expiresAt: number;    // Expiration time
}

Map<string, CacheEntry<any>>
    ├─ "quote:SPY"       → { data: {...}, expiresAt: ... }
    ├─ "quote:DIA"       → { data: {...}, expiresAt: ... }
    ├─ "historical:SPY"  → { data: [...], expiresAt: ... }
    └─ ...
```

### Cache Strategy

| Data Type | Cache Key | TTL | Rationale |
|-----------|-----------|-----|-----------|
| Quote | `quote:${symbol}` | 60s | Frequent updates needed |
| Historical | `historical:${symbol}` | 300s | Changes less frequently |

### Cache Lifecycle

```
Request → Check Cache → Valid? → Return
                ↓ (Invalid/Missing)
            Fetch from API
                ↓
            Store with TTL
                ↓
            Return Data
                
Background Process (every 5 min):
    → Scan all entries
    → Remove expired entries
    → Log cleanup stats
```

## Rate Limiting Architecture

### Tracking Structure

```typescript
interface RateLimitEntry {
  count: number;        // Number of requests
  resetAt: number;      // When to reset counter
}

Map<string, RateLimitEntry>
    ├─ Minute Tracker  → { count: 5, resetAt: ... }
    └─ Month Tracker   → { count: 127, resetAt: ... }
```

### Rate Limit Flow

```
API Request
    ↓
Check Minute Limit (20 req/min)
    ↓ Exceeded?
    ├─ Yes → Return 429 Error
    └─ No → Continue
        ↓
Check Month Limit (500 req/month)
    ↓ Exceeded?
    ├─ Yes → Return 429 Error
    └─ No → Continue
        ↓
Make API Call
    ↓
Increment Both Counters
    ↓
Return Success
```

### Auto-Reset Mechanism

```
Every Request:
    ↓
Check if reset time passed
    ↓ Yes
    ├─ Clear counter
    ├─ Set new reset time
    └─ Continue
    ↓ No
    └─ Use existing counter
```

## WebSocket Architecture

### Server Implementation

```javascript
HTTP Server
    ↓
WebSocket Server (ws library)
    ↓
Client Connections (Set)
    ├─ Client 1
    ├─ Client 2
    └─ Client N
    
Broadcast Timer (2 min)
    ↓
Fetch Latest Data
    ↓
For Each Client:
    ├─ Check Connection Status
    ├─ Send Update Message
    └─ Handle Errors
```

### Message Types

```typescript
type WebSocketMessage = 
  | { type: 'connected', data: {...} }
  | { type: 'update', data: IndexData[] }
  | { type: 'heartbeat', timestamp: string }
  | { type: 'error', error: string }
```

### Client Reconnection

```
Connection Lost
    ↓
Set Status: Disconnected
    ↓
Wait 5 seconds
    ↓
Attempt Reconnect
    ↓ Success?
    ├─ Yes → Set Status: Connected
    └─ No → Wait 5s, Retry
```

## Security Architecture

### API Key Protection

```
Environment Variables (.env)
    ↓
Server-Side Only (lib/api-service.ts)
    ↓
Never Exposed to Client
    ↓
Used in Server API Routes
```

### Request Validation

```
API Request
    ↓
Validate HTTP Method
    ↓
Validate Parameters
    ↓
Sanitize Input
    ↓
Process Request
```

## Performance Optimizations

### 1. Caching Layers

- **In-Memory Cache**: Fastest, 60-300s TTL
- **Browser Cache**: HTTP cache headers
- **CDN Cache**: Static assets (Vercel)

### 2. Code Splitting

- Next.js automatic code splitting
- Dynamic imports for heavy components
- Separate bundles per page

### 3. API Optimization

- Parallel requests where possible
- Sequential with delays to avoid rate limits
- Batch updates via WebSocket

### 4. UI Optimization

- React.memo for expensive components
- Lazy loading for charts
- Optimized re-renders

## Scalability Considerations

### Current Architecture

- Single server instance
- In-memory cache (per instance)
- Rate limiting per instance

### Scaling Strategies

#### Horizontal Scaling

```
Load Balancer
    ├─ Instance 1 (Cache A, Rate Limit A)
    ├─ Instance 2 (Cache B, Rate Limit B)
    └─ Instance 3 (Cache C, Rate Limit C)
```

**Issues**: 
- Cache not shared
- Rate limits not coordinated

**Solutions**:
- Redis for shared cache
- Redis for distributed rate limiting
- Sticky sessions for WebSocket

#### Vertical Scaling

- Increase server resources
- More memory for larger cache
- Better CPU for more connections

### Production Recommendations

1. **Use Redis**:
   ```typescript
   import Redis from 'ioredis';
   const redis = new Redis(process.env.REDIS_URL);
   ```

2. **Distributed Rate Limiting**:
   ```typescript
   import { RateLimiterRedis } from 'rate-limiter-flexible';
   ```

3. **WebSocket Scaling**:
   - Use Socket.io with Redis adapter
   - Or use managed service (Pusher, Ably)

4. **Monitoring**:
   - Add Sentry for error tracking
   - Add DataDog/New Relic for APM
   - Log aggregation (LogDNA, Papertrail)

## Technology Choices

### Why Next.js?

- ✅ Server-side rendering
- ✅ API routes (no separate backend)
- ✅ Automatic code splitting
- ✅ Great developer experience
- ✅ Easy deployment

### Why TypeScript?

- ✅ Type safety
- ✅ Better IDE support
- ✅ Catch errors at compile time
- ✅ Self-documenting code
- ✅ Easier refactoring

### Why In-Memory Cache?

- ✅ Fastest possible
- ✅ No external dependencies
- ✅ Simple implementation
- ✅ Sufficient for single instance
- ⚠️ Not shared across instances

### Why WebSocket?

- ✅ Real-time updates
- ✅ Lower latency than polling
- ✅ Efficient for multiple clients
- ✅ Native browser support
- ⚠️ Requires long-lived connections

## Deployment Architecture

### Vercel (Serverless)

```
User Request
    ↓
Vercel Edge Network (CDN)
    ↓
Serverless Function (API Routes)
    ↓
Alpha Vantage API
```

**Note**: WebSocket requires custom deployment

### Docker (Traditional)

```
Docker Container
    ├─ Next.js App
    ├─ WebSocket Server
    └─ Custom Server (server.js)
```

**Deployment Options**:
- AWS ECS/EKS
- Google Cloud Run
- DigitalOcean App Platform
- Railway
- Heroku

## Future Enhancements

### Short Term

1. **Add More Indices**: Crypto, commodities, forex
2. **User Preferences**: Save favorite indices
3. **Alerts**: Price alerts via email/SMS
4. **Export Data**: CSV/JSON export

### Medium Term

1. **Authentication**: User accounts
2. **Historical Comparison**: Compare multiple indices
3. **Technical Indicators**: RSI, MACD, etc.
4. **News Integration**: Related news articles

### Long Term

1. **Machine Learning**: Price predictions
2. **Portfolio Tracking**: Track investments
3. **Social Features**: Share insights
4. **Mobile Apps**: Native iOS/Android

## Conclusion

This architecture provides a solid foundation for a production-ready financial tracking application with:

- ✅ Efficient caching
- ✅ Rate limit compliance
- ✅ Real-time updates
- ✅ Scalability path
- ✅ Security best practices
- ✅ Great user experience

