# API Documentation

Complete API reference for the Financial Indices Tracker.

## Base URL

**Development**: `http://localhost:3000`  
**Production**: `https://your-app.vercel.app`

## Authentication

No authentication required. API keys are managed server-side.

---

## Endpoints

### 1. Get All Indices

Retrieves current data for all tracked indices.

**Endpoint**: `GET /api/indices`

**Response**: `200 OK`

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
    },
    {
      "symbol": "DIA",
      "name": "Dow Jones ETF",
      "value": 380.50,
      "change": -1.20,
      "changePercent": -0.31,
      "timestamp": "2024-01-15"
    }
  ],
  "timestamp": "2024-01-15T14:30:00.000Z",
  "rateLimit": {
    "minuteUsage": 5,
    "minuteLimit": 20,
    "monthUsage": 127,
    "monthLimit": 500
  }
}
```

**Error Response**: `500 Internal Server Error`

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "rateLimit": {
    "minuteUsage": 20,
    "minuteLimit": 20,
    "monthUsage": 127,
    "monthLimit": 500
  }
}
```

**Caching**: 60 seconds

**Rate Limit Impact**: 1 request per tracked index (5 total)

---

### 2. Get Index Detail

Retrieves detailed information for a specific index including 30-day historical data.

**Endpoint**: `GET /api/indices/:symbol`

**Parameters**:
- `symbol` (path parameter, required): Index symbol (e.g., "SPY", "DIA")

**Example**: `GET /api/indices/SPY`

**Response**: `200 OK`

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
        "date": "2024-01-01",
        "open": 445.00,
        "high": 448.50,
        "low": 444.20,
        "close": 447.80,
        "volume": 75000000
      },
      {
        "date": "2024-01-02",
        "open": 447.80,
        "high": 450.00,
        "low": 446.50,
        "close": 449.20,
        "volume": 82000000
      }
      // ... 28 more days
    ]
  },
  "timestamp": "2024-01-15T14:30:00.000Z",
  "rateLimit": {
    "minuteUsage": 7,
    "minuteLimit": 20,
    "monthUsage": 129,
    "monthLimit": 500
  }
}
```

**Error Responses**:

`400 Bad Request` - Invalid symbol
```json
{
  "success": false,
  "error": "Symbol parameter is required"
}
```

`404 Not Found` - Symbol not found
```json
{
  "success": false,
  "error": "Index not found",
  "rateLimit": { ... }
}
```

`500 Internal Server Error`
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "rateLimit": { ... }
}
```

**Caching**: 
- Quote data: 60 seconds
- Historical data: 300 seconds (5 minutes)

**Rate Limit Impact**: 2 requests (1 for quote, 1 for historical)

---

### 3. Get Cache Statistics

Retrieves cache performance and rate limit statistics.

**Endpoint**: `GET /api/cache/stats`

**Response**: `200 OK`

```json
{
  "success": true,
  "data": {
    "totalEntries": 15,
    "validEntries": 12,
    "expiredEntries": 3,
    "rateLimit": {
      "minuteUsage": 8,
      "minuteLimit": 20,
      "monthUsage": 130,
      "monthLimit": 500
    }
  },
  "timestamp": "2024-01-15T14:30:00.000Z"
}
```

**Caching**: Not cached (real-time stats)

**Rate Limit Impact**: None (internal endpoint)

---

## WebSocket API

### Connection

**Endpoint**: `ws://localhost:3000/api/ws` (development)  
**Endpoint**: `wss://your-app.vercel.app/api/ws` (production)

**Protocol**: WebSocket (ws/wss)

### Message Types

#### 1. Connected

Sent immediately after connection is established.

```json
{
  "type": "connected",
  "data": {
    "message": "Connected to financial data stream"
  },
  "timestamp": "2024-01-15T14:30:00.000Z"
}
```

#### 2. Update

Sent every 2 minutes with latest market data.

```json
{
  "type": "update",
  "data": [
    {
      "symbol": "SPY",
      "name": "S&P 500 ETF",
      "value": 450.25,
      "change": 2.35,
      "changePercent": 0.52,
      "timestamp": "2024-01-15"
    }
    // ... more indices
  ],
  "timestamp": "2024-01-15T14:32:00.000Z"
}
```

#### 3. Heartbeat

Sent every 30 seconds to keep connection alive.

```json
{
  "type": "heartbeat",
  "timestamp": "2024-01-15T14:30:30.000Z"
}
```

#### 4. Error

Sent when an error occurs.

```json
{
  "type": "error",
  "data": {
    "message": "Failed to fetch data"
  },
  "timestamp": "2024-01-15T14:30:00.000Z"
}
```

### Client Messages

#### Subscribe (Optional)

Request updates for specific symbols.

```json
{
  "type": "subscribe",
  "symbols": ["SPY", "DIA", "QQQ"]
}
```

**Response**:
```json
{
  "type": "subscribed",
  "data": {
    "symbols": ["SPY", "DIA", "QQQ"]
  },
  "timestamp": "2024-01-15T14:30:00.000Z"
}
```

---

## Rate Limiting

### Limits

- **Per Minute**: 20 requests
- **Per Month**: 500 requests

### Headers

Rate limit information is included in every API response:

```json
"rateLimit": {
  "minuteUsage": 5,      // Current minute usage
  "minuteLimit": 20,     // Minute limit
  "monthUsage": 127,     // Current month usage
  "monthLimit": 500      // Month limit
}
```

### Exceeding Limits

When rate limits are exceeded:

**Status**: `500 Internal Server Error`

```json
{
  "success": false,
  "error": "Minute rate limit exceeded",
  "rateLimit": {
    "minuteUsage": 20,
    "minuteLimit": 20,
    "monthUsage": 127,
    "monthLimit": 500
  }
}
```

### Best Practices

1. **Use Caching**: Data is cached for 60-300 seconds
2. **Avoid Rapid Requests**: Wait at least 60 seconds between manual refreshes
3. **Use WebSocket**: Receive updates automatically without polling
4. **Monitor Usage**: Check rate limit indicators in UI

---

## Caching

### Cache Keys

| Endpoint | Cache Key | TTL |
|----------|-----------|-----|
| Quote | `quote:${symbol}` | 60s |
| Historical | `historical:${symbol}` | 300s |

### Cache Headers

Responses include cache status:

```json
{
  "success": true,
  "cached": true,  // Indicates if data came from cache
  "data": { ... }
}
```

### Cache Invalidation

Cache entries automatically expire after TTL. Manual invalidation is not supported.

---

## Error Handling

### Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here",
  "rateLimit": { ... }  // Included when available
}
```

### Common Errors

| Status | Error | Cause |
|--------|-------|-------|
| 400 | Bad Request | Invalid parameters |
| 404 | Not Found | Symbol doesn't exist |
| 405 | Method Not Allowed | Wrong HTTP method |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server or API error |

---

## Data Models

### IndexData

```typescript
interface IndexData {
  symbol: string;        // Index symbol (e.g., "SPY")
  name: string;          // Full name (e.g., "S&P 500 ETF")
  value: number;         // Current price
  change: number;        // Price change
  changePercent: number; // Percentage change
  timestamp: string;     // Last update date
}
```

### HistoricalDataPoint

```typescript
interface HistoricalDataPoint {
  date: string;    // Date (YYYY-MM-DD)
  open: number;    // Opening price
  high: number;    // Highest price
  low: number;     // Lowest price
  close: number;   // Closing price
  volume?: number; // Trading volume (optional)
}
```

### IndexDetail

```typescript
interface IndexDetail {
  symbol: string;
  name: string;
  currentValue: number;
  change: number;
  changePercent: number;
  timestamp: string;
  historicalData: HistoricalDataPoint[]; // 30 days
}
```

### ApiResponse

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
  timestamp?: string;
  rateLimit?: {
    minuteUsage: number;
    minuteLimit: number;
    monthUsage: number;
    monthLimit: number;
  };
}
```

---

## Example Usage

### JavaScript/TypeScript

```typescript
// Fetch all indices
async function fetchIndices() {
  const response = await fetch('/api/indices');
  const data: ApiResponse<IndexData[]> = await response.json();
  
  if (data.success) {
    console.log('Indices:', data.data);
    console.log('Rate Limit:', data.rateLimit);
  } else {
    console.error('Error:', data.error);
  }
}

// Fetch specific index
async function fetchIndexDetail(symbol: string) {
  const response = await fetch(`/api/indices/${symbol}`);
  const data: ApiResponse<IndexDetail> = await response.json();
  
  if (data.success) {
    console.log('Current Value:', data.data?.currentValue);
    console.log('Historical Data:', data.data?.historicalData);
  }
}

// WebSocket connection
const ws = new WebSocket('ws://localhost:3000/api/ws');

ws.onopen = () => {
  console.log('Connected');
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'connected':
      console.log('Connection confirmed');
      break;
    case 'update':
      console.log('New data:', message.data);
      break;
    case 'heartbeat':
      console.log('Heartbeat received');
      break;
  }
};
```

### cURL

```bash
# Get all indices
curl http://localhost:3000/api/indices

# Get specific index
curl http://localhost:3000/api/indices/SPY

# Get cache stats
curl http://localhost:3000/api/cache/stats
```

### Python

```python
import requests
import json

# Fetch all indices
response = requests.get('http://localhost:3000/api/indices')
data = response.json()

if data['success']:
    for index in data['data']:
        print(f"{index['symbol']}: ${index['value']}")

# Fetch specific index
response = requests.get('http://localhost:3000/api/indices/SPY')
data = response.json()

if data['success']:
    detail = data['data']
    print(f"Current: ${detail['currentValue']}")
    print(f"Change: {detail['changePercent']}%")
```

---

## Testing

### Test Endpoints

```bash
# Health check (via indices endpoint)
curl http://localhost:3000/api/indices

# Test caching (should be instant on second call)
curl http://localhost:3000/api/indices/SPY
curl http://localhost:3000/api/indices/SPY

# Check cache stats
curl http://localhost:3000/api/cache/stats
```

### Load Testing

```bash
# Using Apache Bench
ab -n 100 -c 10 http://localhost:3000/api/indices

# Using wrk
wrk -t4 -c100 -d30s http://localhost:3000/api/indices
```

---

## Support

For API issues or questions:
- Check the [README.md](./README.md)
- Review [ARCHITECTURE.md](./ARCHITECTURE.md)
- Open an issue on GitHub

---

**Last Updated**: 2024-01-15  
**API Version**: 1.0.0

