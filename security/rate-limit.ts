import rateLimit from 'express-rate-limit';
import { SECURITY_CONFIG } from './security.config';

export const loginRateLimiter = rateLimit({
  windowMs: SECURITY_CONFIG.rateLimits.loginWindowMs,
  max: SECURITY_CONFIG.rateLimits.loginMaxAttempts,
  message: { error: 'Too many login attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const publicWriteRateLimiter = rateLimit({
  windowMs: SECURITY_CONFIG.rateLimits.publicWriteWindowMs,
  max: SECURITY_CONFIG.rateLimits.publicWriteMax,
  message: { error: 'Rate limit exceeded for public submissions.' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const globalApiRateLimiter = rateLimit({
  windowMs: SECURITY_CONFIG.rateLimits.apiWindowMs,
  max: SECURITY_CONFIG.rateLimits.apiMaxRequests,
  message: { error: 'Too many requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});
