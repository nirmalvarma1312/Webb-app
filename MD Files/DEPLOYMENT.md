# Deployment Guide

This guide covers deploying the Financial Indices Tracker to various platforms.

## 📦 Vercel Deployment (Recommended)

Vercel is the recommended platform as it's built by the creators of Next.js.

### Prerequisites

- GitHub account
- Vercel account (free tier available)
- Alpha Vantage API key

### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next

### Step 3: Configure Environment Variables

In Vercel dashboard, add these environment variables:

```
ALPHA_VANTAGE_API_KEY=your_actual_api_key
CACHE_TTL_SECONDS=60
MIN_REFRESH_INTERVAL_SECONDS=60
MAX_REQUESTS_PER_MINUTE=20
MAX_REQUESTS_PER_MONTH=500
```

### Step 4: Deploy

Click "Deploy" and wait for the build to complete.

### Step 5: Custom Domain (Optional)

1. Go to Settings > Domains
2. Add your custom domain
3. Configure DNS settings as instructed

### Important Notes for Vercel

⚠️ **WebSocket Limitations**: Vercel's serverless functions don't support long-lived WebSocket connections. For WebSocket functionality, consider:

1. **Use Vercel + External WebSocket Service**:
   - Deploy main app to Vercel
   - Use a service like Pusher or Ably for WebSockets
   - Or deploy WebSocket server separately (see below)

2. **Alternative: Use Polling**:
   - Modify the app to use HTTP polling instead of WebSockets
   - Set interval to refresh data every 2 minutes

## 🐳 Docker Deployment

For full WebSocket support, deploy using Docker.

### Step 1: Create Dockerfile

```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/server.js ./server.js

USER nextjs
EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]
```

### Step 2: Build and Run

```bash
# Build image
docker build -t financial-tracker .

# Run container
docker run -p 3000:3000 \
  -e ALPHA_VANTAGE_API_KEY=your_key \
  -e CACHE_TTL_SECONDS=60 \
  financial-tracker
```

### Step 3: Deploy to Cloud

#### AWS ECS

```bash
# Push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag financial-tracker:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/financial-tracker:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/financial-tracker:latest

# Create ECS task definition and service
```

#### Google Cloud Run

```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT-ID/financial-tracker

# Deploy
gcloud run deploy financial-tracker \
  --image gcr.io/PROJECT-ID/financial-tracker \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars ALPHA_VANTAGE_API_KEY=your_key
```

## 🚀 Railway Deployment

Railway supports WebSockets and is easy to set up.

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login and Initialize

```bash
railway login
railway init
```

### Step 3: Add Environment Variables

```bash
railway variables set ALPHA_VANTAGE_API_KEY=your_key
railway variables set CACHE_TTL_SECONDS=60
railway variables set MAX_REQUESTS_PER_MINUTE=20
railway variables set MAX_REQUESTS_PER_MONTH=500
```

### Step 4: Deploy

```bash
railway up
```

## 🌊 DigitalOcean App Platform

### Step 1: Create App

1. Go to DigitalOcean App Platform
2. Create new app from GitHub repository
3. Select your repository

### Step 2: Configure Build

- Build Command: `npm run build`
- Run Command: `npm start`
- HTTP Port: 3000

### Step 3: Add Environment Variables

Add all required environment variables in the app settings.

### Step 4: Deploy

Click "Deploy" and wait for completion.

## 📊 Monitoring and Logging

### Vercel Analytics

```bash
npm install @vercel/analytics
```

Add to `_app.tsx`:
```typescript
import { Analytics } from '@vercel/analytics/react';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Analytics />
    </>
  );
}
```

### Custom Logging

For production, consider:
- Sentry for error tracking
- LogRocket for session replay
- DataDog for APM

## 🔒 Security Checklist

Before deploying to production:

- [ ] All API keys in environment variables
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Dependencies updated
- [ ] Error handling in place
- [ ] Logging configured

## 🧪 Pre-Deployment Testing

```bash
# Run type checking
npm run type-check

# Run linting
npm run lint

# Build for production
npm run build

# Test production build locally
npm start
```

## 📈 Performance Optimization

### Enable Compression

Add to `next.config.js`:
```javascript
module.exports = {
  compress: true,
  // ... other config
}
```

### CDN Configuration

For static assets, configure CDN:
1. Vercel automatically uses CDN
2. For custom deployment, use CloudFlare or AWS CloudFront

## 🔄 Continuous Deployment

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run type-check
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📞 Support

For deployment issues:
1. Check platform-specific documentation
2. Review application logs
3. Verify environment variables
4. Test API connectivity
5. Check rate limits

---

**Happy Deploying! 🚀**

