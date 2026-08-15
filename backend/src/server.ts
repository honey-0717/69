import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import healthRoutes from './routes/health';
import publicDataRoutes from './routes/public-data';
import authRoutes from './routes/auth';
import servicesRoutes from './routes/services';
import profileRoutes from './routes/profile';
import availabilityRoutes from './routes/availability';
import paymentsRoutes from './routes/payments';
import reviewsRoutes from './routes/reviews';
import termsRoutes from './routes/terms';
import socialContactsRoutes from './routes/social-contacts';
import messageTemplateRoutes from './routes/message-template';
import activityRoutes from './routes/activity';
import eventsRoutes from './routes/events';
import categoriesRoutes from './routes/categories';
import googleSheetsSyncRoutes from './routes/google-sheets-sync';

import { initDatabaseStore } from './store';

dotenv.config();

const app = express();
app.set('trust proxy', 1);

let envPort = process.env.PORT;
if (process.env.NODE_ENV === 'production' && (!envPort || envPort === '5000')) {
  envPort = '10000';
}
const PORT = Number(envPort || 5000);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const CORS_ORIGIN = process.env.CORS_ORIGIN || FRONTEND_URL;

const allowedOrigins = new Set(
  [FRONTEND_URL, CORS_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:3000'].filter(Boolean)
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      if (process.env.NODE_ENV !== 'production' && (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1'))) {
        return callback(null, true);
      }
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security Headers Middleware
app.use((_req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// Mount API Routes
app.use('/api/health', healthRoutes);
app.use('/api/public-data', publicDataRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/terms', termsRoutes);
app.use('/api/social-contacts', socialContactsRoutes);
app.use('/api/message-template', messageTemplateRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/google-sheets-sync', googleSheetsSyncRoutes);

// Global 404 Route Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[API ERROR]', err?.stack || err?.message || err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err?.message || 'Internal Server Error'
  });
});

import { closeAllSseClients } from './events';
import { Socket } from 'net';

let server: any;
const openSockets = new Set<Socket>();

initDatabaseStore().then(() => {
  server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BACKEND] HotHarini69 Express API server running on 0.0.0.0:${PORT}`);
  });


  server.on('error', (err: any) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`[BACKEND] Port ${PORT} is already in use by an active server process.`);
      console.error('[BACKEND] Duplicate backend listener prevented.');
    } else {
      console.error('[BACKEND SERVER ERROR]', err);
    }
  });

  server.on('connection', (socket: Socket) => {
    openSockets.add(socket);
    socket.on('close', () => openSockets.delete(socket));
  });
});

let isShuttingDown = false;
function gracefulShutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`[SHUTDOWN] Received ${signal}, closing Express server gracefully...`);

  try {
    closeAllSseClients();
  } catch (e) {}

  for (const socket of openSockets) {
    try {
      if (!socket.destroyed) {
        socket.end();
      }
    } catch (e) {}
  }
  openSockets.clear();

  if (server) {
    server.close(() => {
      console.log('[SHUTDOWN] Express server closed successfully.');
      process.exit(0);
    });
    setTimeout(() => {
      console.log('[SHUTDOWN] Force exiting process.');
      process.exit(0);
    }, 500).unref();
  } else {
    process.exit(0);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('uncaughtException', (err: Error) => {
  console.error('[UNCAUGHT EXCEPTION]', err.stack || err.message || err);
});
process.on('unhandledRejection', (reason: any) => {
  console.error('[UNHANDLED REJECTION]', reason);
});

