export function logAuditAction(action: string, user: string, details?: Record<string, any>) {
  const sanitizedDetails = details ? { ...details } : {};
  if (sanitizedDetails.password) delete sanitizedDetails.password;
  if (sanitizedDetails.token) delete sanitizedDetails.token;
  if (sanitizedDetails.auth_token) delete sanitizedDetails.auth_token;

  const timestamp = new Date().toISOString();
  console.log(`[AUDIT LOG ${timestamp}] Action: ${action} | User: ${user} | Details:`, JSON.stringify(sanitizedDetails));
}
