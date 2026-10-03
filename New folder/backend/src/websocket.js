const WebSocket = require('ws');

class WebSocketManager {
  constructor() {
    this.wss = null;
    this.clients = new Set();
  }

  init(server) {
    this.wss = new WebSocket.Server({ server, path: '/ws' });

    this.wss.on('connection', (ws, req) => {
      this.clients.add(ws);
      console.log(`[WS] Client connected. Total active clients: ${this.clients.size}`);

      // Send initial welcome & connection confirmation
      ws.send(JSON.stringify({
        type: 'CONNECTION_ACK',
        data: { message: 'Connected to Wheelchair Obstacle Detection Telemetry Stream', timestamp: new Date().toISOString() }
      }));

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log(`[WS] Client disconnected. Total active clients: ${this.clients.size}`);
      });

      ws.on('error', (err) => {
        console.error('[WS] Client socket error:', err.message);
        this.clients.delete(ws);
      });
    });
  }

  broadcast(type, payload) {
    if (!this.wss || this.clients.size === 0) return;

    const message = JSON.stringify({
      type,
      data: payload,
      timestamp: new Date().toISOString()
    });

    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(message);
        } catch (err) {
          console.error('[WS] Failed to send to client:', err.message);
        }
      }
    }
  }
}

module.exports = new WebSocketManager();
