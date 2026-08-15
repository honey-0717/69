import { Router, Request, Response } from 'express';
import { adminSupabase } from '../db';

const router = Router();

let lastHealthCheck = 0;
let lastHealthResult: any = null;

router.get('/', async (_req: Request, res: Response) => {
  const now = Date.now();
  if (lastHealthResult && now - lastHealthCheck < 2000) {
    return res.json({
      ...lastHealthResult,
      timestamp: new Date().toISOString(),
    });
  }

  try {
    const { error } = await adminSupabase.from('profile').select('id').limit(1);
    if (error) {
      return res.status(500).json({
        status: 'error',
        database: 'disconnected',
        message: error.message,
      });
    }
    lastHealthResult = { status: 'ok', database: 'connected' };
    lastHealthCheck = now;
    return res.json({
      ...lastHealthResult,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({
      status: 'error',
      database: 'disconnected',
      message: err.message,
    });
  }
});

export default router;
