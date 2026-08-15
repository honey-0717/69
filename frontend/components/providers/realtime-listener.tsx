'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { realtimeManager } from '@/lib/realtime';

export function RealtimeListener() {
  const router = useRouter();
  const refreshDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const lastEventTypeRef = useRef<string | null>(null);

  useEffect(() => {
    const unsubscribe = realtimeManager.subscribe((data) => {
      if (!data || !data.type || data.type === 'connected' || data.type === 'ping' || data.type === 'shutdown') {
        return;
      }

      // Do not refresh if tab is backgrounded
      if (typeof document !== 'undefined' && document.hidden) {
        return;
      }

      // Debounce router refresh by 250ms
      if (refreshDebounceRef.current) {
        clearTimeout(refreshDebounceRef.current);
      }

      lastEventTypeRef.current = data.type;

      refreshDebounceRef.current = setTimeout(() => {
        try {
          router.refresh();
        } catch (e) {
          // Ignore refresh errors during navigation
        }
      }, 250);
    });

    return () => {
      unsubscribe();
      if (refreshDebounceRef.current) {
        clearTimeout(refreshDebounceRef.current);
      }
    };
  }, [router]);

  return null;
}
