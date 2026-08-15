# Security Infrastructure & Rules — HotHarini69

This folder contains security configurations, middleware helpers, validation schemas, rate limiting rules, audit logging, and security check utilities for the HotHarini69 application.

## Directory Structure

- `security.config.ts`: Global security parameters, allowed origins, session cookie options, and rate limits.
- `headers.ts`: Middleware for standard HTTP security headers (CSP, HSTS, X-Frame-Options, Referrer-Policy, X-Content-Type-Options).
- `rate-limit.ts`: Rate limiting middleware for authentication, public submissions, and API endpoints.
- `validation.ts`: Server-side payload validation schemas and input sanitizers.
- `auth-rules.ts`: Session validation rules and authorization helper logic.
- `audit-log.ts`: Redacted administrative audit logger.
- `security-checks.ts`: Automated diagnostic script verifying operational security controls.

## Security Principles

1. **Database Authority**: Supabase PostgreSQL is the primary source of truth. Mutations must succeed in PostgreSQL before broadcasting changes or acknowledging requests.
2. **Session Security**: Admin sessions use `HttpOnly`, `SameSite: lax` cookies with HMAC-SHA256 signatures.
3. **Defense-in-Depth**: Input validation, rate limiting, and HTTP security headers are enforced on all server entry points.
