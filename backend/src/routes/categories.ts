import { Router, Request, Response } from 'express';
import { store } from '../store';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  return res.json(store.categories);
});

export default router;
