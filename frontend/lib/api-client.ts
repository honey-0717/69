// Client-side REST API caller for HotHarini69 backend endpoints with instant SWR caching

type CacheEntry = {
  data: any;
  timestamp: number;
};

const apiCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute TTL for GET requests

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

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
  const method = (options.method || 'GET').toUpperCase();
  const isGet = method === 'GET';

  // Return cached GET response instantly if available and valid
  if (isGet) {
    const cached = apiCache.get(endpoint);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      // Revalidate in background asynchronously without blocking UI
      fetch(endpoint, { ...options, credentials: 'include' })
        .then((res) => (res.ok ? res.json() : null))
        .then((fresh) => {
          if (fresh) {
            apiCache.set(endpoint, { data: fresh, timestamp: Date.now() });
          }
        })
        .catch(() => {});

      return { data: cached.data as T, error: null };
    }
  }

  try {
    const res = await fetch(endpoint, {
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
      apiCache.set(endpoint, { data: body, timestamp: Date.now() });
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
    const res = await fetch(endpoint, {
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
