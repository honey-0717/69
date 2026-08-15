import { Response } from 'express';

const sseClients: Set<Response> = new Set();

export function addSseClient(res: Response) {
  sseClients.add(res);
}

export function removeSseClient(res: Response) {
  sseClients.delete(res);
}

export function closeAllSseClients() {
  for (const client of sseClients) {
    try {
      if (!client.writableEnded) {
        client.write(`data: ${JSON.stringify({ type: 'shutdown', timestamp: new Date().toISOString() })}\n\n`);
        client.end();
      }
    } catch (e) {
      // Ignore cleanup errors on shutdown
    }
  }
  sseClients.clear();
}

export function broadcastChange(type: string, payload?: any) {
  const eventData = `data: ${JSON.stringify({ type, payload, timestamp: new Date().toISOString() })}\n\n`;
  for (const client of sseClients) {
    try {
      if (client.writableEnded || client.destroyed) {
        sseClients.delete(client);
        continue;
      }
      client.write(eventData);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}
