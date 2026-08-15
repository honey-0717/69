import { Router, Request, Response } from 'express';
import { addSseClient, removeSseClient } from '../events';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof res.flushHeaders === 'function') {
    res.flushHeaders();
  }

  try {
    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);
  } catch (e) {}

  addSseClient(res);

  let cleanedUp = false;
  function cleanup() {
    if (cleanedUp) return;
    cleanedUp = true;
    clearInterval(keepAlive);
    removeSseClient(res);
  }

  const keepAlive = setInterval(() => {
    try {
      if (res.writableEnded || res.destroyed) {
        cleanup();
        return;
      }
      res.write(': ping\n\n');
    } catch (e) {
      cleanup();
    }
  }, 15000);

  req.on('close', cleanup);
  res.on('close', cleanup);
  req.on('error', cleanup);
  res.on('error', cleanup);
});

export default router;
