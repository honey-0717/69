import { Router, Request, Response } from 'express';
import { getPublicData } from '../store';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  return res.json(getPublicData());
});

export default router;
