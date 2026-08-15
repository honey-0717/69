'use client';

import { useEffect, useState } from 'react';
import type { Profile } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import { getAvailabilityConfig } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { logAdminActivity } from '@/lib/activity';
import { apiRequest } from '@/lib/api-client';

const statuses: ('available' | 'busy' | 'offline')[] = ['available', 'busy', 'offline'];

export default function AdminAvailabilityPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [current, setCurrent] = useState<'available' | 'busy' | 'offline'>('available');

  useEffect(() => {
    apiRequest<Profile>('/api/profile').then(({ data }) => {
      setProfile(data);
      setCurrent(data?.availability ?? 'available');
      setLoading(false);
    });
  }, []);

  async function save(status: 'available' | 'busy' | 'offline') {
    if (status === current || saving) return;

    const previousStatus = current;
    setCurrent(status); // Instant Optimistic UI update
    setSaving(true);

    const { data, error } = await apiRequest<{ availability: 'available' | 'busy' | 'offline' }>(
      '/api/availability',
      {
        method: 'PUT',
        body: JSON.stringify({ availability: status }),
      }
    );

    if (error) {
      setCurrent(previousStatus); // Rollback on error
      toast.error('Failed to update availability: ' + error);
    } else if (data) {
      toast.success(`Availability set to ${data.availability}`);
      logAdminActivity('availability_changed', `Changed availability status to ${data.availability.toUpperCase()}`, { status: data.availability });
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-md">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Availability</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Control your public availability status</p>
      </div>

      <div className="space-y-3">
        {statuses.map((status) => {
          const config = getAvailabilityConfig(status);
          const isActive = current === status;
          return (
            <button
              key={status}
              onClick={() => save(status)}
              disabled={saving}
              className={cn(
                'w-full glass-card p-5 flex items-center justify-between transition-all duration-300',
                isActive ? 'border-2' : 'hover:bg-white/[0.07]',
                isActive && config.border
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn('w-3 h-3 rounded-full', config.dot, isActive && 'animate-pulse')} />
                <div className="text-left">
                  <div className={cn('font-semibold', isActive ? config.color : 'text-white')}>
                    {config.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {status === 'available' && 'Customers can contact you immediately'}
                    {status === 'busy' && 'You are currently busy with other sessions'}
                    {status === 'offline' && 'You are not available right now'}
                  </div>
                </div>
              </div>
              {isActive && (
                <div className={cn('w-6 h-6 rounded-full flex items-center justify-center', config.bg)}>
                  <span className={cn('text-xs', config.color)}>✓</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="glass-card p-4">
        <p className="text-xs text-muted-foreground leading-relaxed">
          When you change your availability, the public website updates immediately to show the new status. There is no weekly scheduling — this is a simple on/off toggle.
        </p>
      </div>
    </div>
  );
}
