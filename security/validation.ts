export function sanitizeString(input: any): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

export function validateServiceInput(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Payload must be an object' };
  }
  if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
    return { valid: false, error: 'Service name is required' };
  }
  if (data.price !== undefined && (typeof data.price !== 'number' || data.price < 0)) {
    return { valid: false, error: 'Service price must be a non-negative number' };
  }
  return { valid: true };
}

export function validateReviewInput(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Payload must be an object' };
  }
  if (!data.rating || typeof data.rating !== 'number' || data.rating < 1 || data.rating > 5) {
    return { valid: false, error: 'Rating must be a number between 1 and 5' };
  }
  return { valid: true };
}
