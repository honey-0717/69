import { SECURITY_CONFIG } from './security.config';

export function runSecurityDiagnostics(): boolean {
  console.log('====================================================');
  console.log('RUNNING SYSTEM SECURITY DIAGNOSTICS');
  console.log('====================================================');

  let passes = 0;
  let total = 0;

  // Check 1: Cookie configuration
  total++;
  if (SECURITY_CONFIG.session.httpOnly && SECURITY_CONFIG.session.cookieName === 'auth_token') {
    console.log('[PASS] HttpOnly auth_token cookie enforcement enabled.');
    passes++;
  } else {
    console.log('[FAIL] Insecure cookie configuration.');
  }

  // Check 2: Rate limit configuration
  total++;
  if (SECURITY_CONFIG.rateLimits.loginMaxAttempts <= 30) {
    console.log('[PASS] Login rate limiting protection configured.');
    passes++;
  } else {
    console.log('[FAIL] Weak login rate limiting.');
  }

  // Check 3: CORS Allowed Origins
  total++;
  if (Array.isArray(SECURITY_CONFIG.allowedOrigins) && SECURITY_CONFIG.allowedOrigins.length > 0) {
    console.log('[PASS] Explicit CORS allowed origins defined.');
    passes++;
  } else {
    console.log('[FAIL] Missing explicit CORS origins.');
  }

  console.log(`\nDiagnostics summary: ${passes}/${total} security checks passed.`);
  return passes === total;
}

if (require.main === module) {
  runSecurityDiagnostics();
}
