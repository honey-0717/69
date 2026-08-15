export const SECURITY_CONFIG = {
  session: {
    cookieName: 'auth_token',
    maxAgeDays: 7,
    sameSite: 'lax' as const,
    httpOnly: true,
  },
  rateLimits: {
    loginWindowMs: 15 * 60 * 1000, // 15 minutes
    loginMaxAttempts: 30,
    apiWindowMs: 1 * 60 * 1000,    // 1 minute
    apiMaxRequests: 120,
    publicWriteWindowMs: 5 * 60 * 1000, // 5 minutes
    publicWriteMax: 10,
  },
  requestLimits: {
    jsonBodyLimit: '10mb',
    urlEncodedLimit: '10mb',
  },
  allowedOrigins: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ],
  allowedUploadMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
  ],
  maxUploadSizeBytes: 5 * 1024 * 1024, // 5 MB
};
