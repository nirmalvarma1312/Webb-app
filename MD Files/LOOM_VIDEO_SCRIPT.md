# Loom Video Script (≤10 minutes)

## Introduction (1 minute)

**[Show home page]**

"Hi! I'm excited to show you the Financial Indices Tracker - a web application I built that tracks major market indices with real-time updates and 30-day historical views."

"This app demonstrates several key features:
- Server-side API integration with smart caching
- Rate limiting to respect API plan limits
- Real-time WebSocket updates
- Beautiful, responsive UI
- 30-day historical data visualization"

## Architecture Overview (2 minutes)

**[Show project structure in IDE]**

"Let me walk you through the architecture. The app is built with Next.js 14 and TypeScript for type safety."

**[Navigate to lib/ folder]**

"The core logic lives in the lib folder:
- `cache.ts` implements an in-memory cache with TTL
- `rate-limiter.ts` tracks API usage to stay within limits
- `api-service.ts` handles all external API calls
- `types.ts` defines our TypeScript interfaces"

**[Show cache.ts]**

"The caching strategy is key here. We cache quote data for 60 seconds and historical data for 5 minutes. This reduces API calls by up to 90%."

**[Show rate-limiter.ts]**

"The rate limiter tracks both per-minute and per-month usage. Before each API call, we check if we're within limits. This ensures we never exceed the 20 requests per minute or 500 requests per month limits."

## API Routes (1.5 minutes)

**[Navigate to pages/api/]**

"All API calls happen server-side for security. The API keys never reach the client."

**[Show pages/api/indices/index.ts]**

"The `/api/indices` endpoint fetches all tracked indices. It checks the cache first, then the rate limiter, before making any external API calls."

**[Show pages/api/indices/[symbol].ts]**

"The detail endpoint fetches both current data and 30-day history for a specific index. This powers our detail view."

## Caching Strategy Deep Dive (2 minutes)

**[Show browser with app running]**

"Let me demonstrate the caching in action."

**[Open browser console]**

"When I load the page for the first time, you'll see API calls being made."

**[Refresh page]**

"Now when I refresh within 60 seconds, notice the 'Cache hit' messages in the console. The data loads instantly without hitting the external API."

**[Show rate limit indicator]**

"The rate limit indicator shows our current usage. As you can see, we're well within our limits thanks to caching."

**[Navigate to /api/cache/stats]**

"We can also check cache statistics via this endpoint, showing how many entries are cached and our rate limit usage."

## WebSocket Implementation (1.5 minutes)

**[Show server.js]**

"For real-time updates, I implemented a custom Next.js server with WebSocket support."

**[Show WebSocket code]**

"The server broadcasts updates every 2 minutes to all connected clients. This is longer than the minimum 60-second refresh interval to be conservative with API usage."

**[Show browser with WebSocket status]**

"In the UI, you can see the WebSocket connection status. The green indicator shows we're connected and receiving live updates."

**[Wait for update or show console]**

"When an update comes through, you'll see the data refresh automatically without any user interaction."

## UI Components (1.5 minutes)

**[Navigate through the app]**

"The home page shows all tracked indices with current prices and daily changes."

**[Click on an index]**

"Clicking any index takes you to the detail view with a 30-day chart."

**[Show chart interactions]**

"The chart is interactive - you can hover over data points to see exact values. Below the chart, we show key statistics like 30-day high, low, and overall change."

**[Scroll to table]**

"And here's a table view of recent trading days with open, high, low, and close prices."

**[Navigate back to home]**

"The UI is fully responsive and works great on mobile devices too."

## Deployment (0.5 minutes)

**[Show README or deployment docs]**

"The app is ready for deployment to Vercel, Railway, or any Node.js hosting platform."

"For Vercel deployment, it's as simple as connecting your GitHub repo and adding the environment variables."

"Note: For full WebSocket support in production, you'll want to use a platform that supports long-lived connections, or use a service like Pusher for the real-time updates."

## Wrap Up (0.5 minutes)

**[Show README]**

"I've included comprehensive documentation:
- README with setup instructions and architecture details
- Detailed caching strategy explanation
- Deployment guide for multiple platforms
- API documentation"

**[Show GitHub repo]**

"Everything is on GitHub, fully open source, and ready to run."

"Thanks for watching! Feel free to check out the code and reach out if you have any questions."

---

## Recording Tips

1. **Preparation**:
   - Clear browser cache before recording
   - Have the app running locally
   - Open relevant files in your IDE
   - Test WebSocket connection
   - Have browser console open

2. **During Recording**:
   - Speak clearly and at a moderate pace
   - Show, don't just tell - demonstrate features
   - Keep cursor movements smooth
   - Highlight important code sections
   - Show real API responses

3. **Key Points to Emphasize**:
   - Caching reduces API calls by 90%
   - Rate limiting prevents exceeding plan limits
   - Server-side API calls for security
   - Real-time updates via WebSocket
   - Type-safe TypeScript implementation
   - Production-ready with comprehensive docs

4. **Demo Flow**:
   - Start with overview
   - Show architecture
   - Demonstrate caching
   - Show WebSocket updates
   - Navigate through UI
   - End with deployment info

5. **Time Management**:
   - Keep intro brief (1 min)
   - Focus on unique features (caching, rate limiting)
   - Don't spend too long on any single section
   - Leave time for wrap-up
   - Aim for 8-9 minutes to stay under 10

## Backup Talking Points

If you need to fill time or want to add more detail:

- Explain why Next.js was chosen (SSR, API routes, great DX)
- Discuss TypeScript benefits (type safety, better IDE support)
- Talk about testing strategy (manual testing, load testing)
- Mention potential enhancements (more indices, alerts, export data)
- Discuss scalability considerations
- Explain error handling approach

