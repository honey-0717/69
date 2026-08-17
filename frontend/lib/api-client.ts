// Client-side REST API caller for HotHarini69 backend endpoints with instant SWR caching

type CacheEntry = {
  data: any;
  timestamp: number;
};

const apiCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 2 * 1000; // 2 seconds TTL for instant data sync

export function invalidateApiCache(endpointPattern?: string) {
  if (!endpointPattern) {
    apiCache.clear();
    return;
  }
  apiCache.forEach((_, key) => {
    if (key.includes(endpointPattern)) {
      apiCache.delete(key);
    }
  });
}

function getApiUrl(endpoint: string): string {
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://69-production-8508.up.railway.app';
  const cleanBase = baseUrl.trim().replace(/\/+$/, '');
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${cleanBase}${cleanEndpoint}`;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
  const targetUrl = getApiUrl(endpoint);
  const method = (options.method || 'GET').toUpperCase();
  const isGet = method === 'GET';

  // Return cached GET response instantly if available and valid
  if (isGet) {
    const cached = apiCache.get(targetUrl);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      // Revalidate in background asynchronously without blocking UI
      fetch(targetUrl, { ...options, credentials: 'include' })
        .then((res) => (res.ok ? res.json() : null))
        .then((fresh) => {
          if (fresh) {
            apiCache.set(targetUrl, { data: fresh, timestamp: Date.now() });
          }
        })
        .catch(() => {});

      return { data: cached.data as T, error: null };
    }
  }

  try {
    const res = await fetch(targetUrl, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      credentials: 'include',
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        data: null,
        error: body?.error || body?.message || `Request failed with status ${res.status}`,
      };
    }

    if (isGet) {
      apiCache.set(targetUrl, { data: body, timestamp: Date.now() });
    } else {
      // Invalidate cache on mutations
      invalidateApiCache();
    }

    return { data: body as T, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Network error' };
  }
}

export async function apiUpload<T = any>(
  endpoint: string,
  formData: FormData
): Promise<{ data: T | null; error: string | null }> {
  try {
    const targetUrl = getApiUrl(endpoint);
    const res = await fetch(targetUrl, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        data: null,
        error: body?.error || body?.message || `Upload failed with status ${res.status}`,
      };
    }

    invalidateApiCache();
    return { data: body as T, error: null };
  } catch (err: any) {
    return { data: null, error: err.message || 'Upload error' };
  }
}
