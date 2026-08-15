'use client';

import { useEffect, useState } from 'react';
import type { Profile, Service, Review } from './supabase';
import { apiRequest, invalidateApiCache } from './api-client';

type RealtimeCallback = (eventData: any) => void;

class SharedRealtimeManager {
  private eventSource: EventSource | null = null;
  private listeners: Set<RealtimeCallback> = new Set();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private reconnectDelay = 3000;
  private isConnecting = false;

  public subscribe(callback: RealtimeCallback): () => void {
    this.listeners.add(callback);
    if (!this.eventSource && !this.isConnecting && typeof window !== 'undefined') {
      this.connect();
    }
    return () => {
      this.listeners.delete(callback);
      if (this.listeners.size === 0) {
        this.disconnect();
      }
    };
  }

  private connect() {
    if (typeof window === 'undefined' || this.eventSource) return;
    this.isConnecting = true;

    try {
      this.eventSource = new EventSource('/api/events');

      this.eventSource.onopen = () => {
        this.isConnecting = false;
        this.reconnectDelay = 3000; // Reset backoff on success
      };

      this.eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          invalidateApiCache();
          this.listeners.forEach((listener) => {
            try {
              listener(parsed);
            } catch (e) {}
          });
        } catch (e) {}
      };

      this.eventSource.onerror = () => {
        this.isConnecting = false;
        if (this.eventSource) {
          this.eventSource.close();
          this.eventSource = null;
        }

        if (this.listeners.size > 0 && !this.reconnectTimeout) {
          this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = null;
            this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 30000);
            this.connect();
          }, this.reconnectDelay);
        }
      };
    } catch (e) {
      this.isConnecting = false;
    }
  }

  private disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isConnecting = false;
  }
}

export const realtimeManager = new SharedRealtimeManager();

export function subscribeToRealtime(callback: RealtimeCallback) {
  return realtimeManager.subscribe(callback);
}

export function useRealtimeProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);

  const fetchProfile = () => {
    apiRequest<Profile>('/api/profile').then(({ data }) => {
      if (data) setProfile(data);
    });
  };

  useEffect(() => {
    fetchProfile();
    return realtimeManager.subscribe((parsed) => {
      if (parsed.type && (parsed.type.includes('profile') || parsed.type.includes('availability'))) {
        fetchProfile();
      }
    });
  }, []);

  return profile;
}

export function useRealtimeServices() {
  const [services, setServices] = useState<Service[]>([]);

  const fetchServices = () => {
    apiRequest<Service[]>('/api/services').then(({ data }) => {
      if (data && Array.isArray(data)) setServices(data);
    });
  };

  useEffect(() => {
    fetchServices();
    return realtimeManager.subscribe((parsed) => {
      if (parsed.type && parsed.type.includes('service')) {
        fetchServices();
      }
    });
  }, []);

  return services;
}

export function useRealtimeReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);

  const fetchReviews = () => {
    apiRequest<Review[]>('/api/reviews').then(({ data }) => {
      if (data && Array.isArray(data)) setReviews(data);
    });
  };

  useEffect(() => {
    fetchReviews();
    return realtimeManager.subscribe((parsed) => {
      if (parsed.type && parsed.type.includes('review')) {
        fetchReviews();
      }
    });
  }, []);

  return reviews;
}

export function useRealtimePublicData() {
  const [publicData, setPublicData] = useState<any>(null);

  const fetchPublicData = () => {
    apiRequest('/api/public-data').then(({ data }) => {
      if (data) setPublicData(data);
    });
  };

  useEffect(() => {
    fetchPublicData();
    return realtimeManager.subscribe(() => {
      fetchPublicData();
    });
  }, []);

  return publicData;
}
