/**
 * Custom Next.js server with WebSocket support
 * Provides real-time updates for financial data
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { WebSocketServer } = require('ws');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Create WebSocket server
  const wss = new WebSocketServer({ 
    server,
    path: '/api/ws'
  });

  const clients = new Set();
  let updateInterval = null;

  wss.on('connection', (ws) => {
    console.log('[WebSocket] Client connected');
    clients.add(ws);

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connected',
      data: { message: 'Connected to financial data stream' },
      timestamp: new Date().toISOString(),
    }));

    // Start broadcasting if this is the first client
    if (clients.size === 1 && !updateInterval) {
      startBroadcasting();
    }

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log('[WebSocket] Received:', data);
        
        // Handle client requests (e.g., subscribe to specific symbols)
        if (data.type === 'subscribe') {
          ws.send(JSON.stringify({
            type: 'subscribed',
            data: { symbols: data.symbols },
            timestamp: new Date().toISOString(),
          }));
        }
      } catch (error) {
        console.error('[WebSocket] Error parsing message:', error);
      }
    });

    ws.on('close', () => {
      console.log('[WebSocket] Client disconnected');
      clients.delete(ws);

      // Stop broadcasting if no clients
      if (clients.size === 0 && updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
        console.log('[WebSocket] Stopped broadcasting');
      }
    });

    ws.on('error', (error) => {
      console.error('[WebSocket] Error:', error);
      clients.delete(ws);
    });
  });

  function startBroadcasting() {
    console.log('[WebSocket] Started broadcasting');
    
    // Send updates every 2 minutes (120 seconds)
    updateInterval = setInterval(async () => {
      if (clients.size === 0) return;

      try {
        // Fetch latest data from our API
        const response = await fetch(`http://localhost:${port}/api/indices`);
        const data = await response.json();

        const message = JSON.stringify({
          type: 'update',
          data: data.data,
          timestamp: new Date().toISOString(),
        });

        // Broadcast to all connected clients
        clients.forEach((client) => {
          if (client.readyState === 1) { // OPEN
            client.send(message);
          }
        });

        console.log(`[WebSocket] Broadcasted update to ${clients.size} clients`);
      } catch (error) {
        console.error('[WebSocket] Error broadcasting:', error);
      }
    }, 120000); // 2 minutes

    // Send heartbeat every 30 seconds
    setInterval(() => {
      const heartbeat = JSON.stringify({
        type: 'heartbeat',
        timestamp: new Date().toISOString(),
      });

      clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(heartbeat);
        }
      });
    }, 30000);
  }

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket server ready on ws://${hostname}:${port}/api/ws`);
  });
});

