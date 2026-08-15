'use client';

import { useEffect, useState } from 'react';
import type { Profile, Service, Review } from '@/lib/supabase';
import { Loader2, Briefcase, Star, TrendingUp, CircleDot } from 'lucide-react';
import { getAvailabilityConfig } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/api-client';

type ActivityItem = {
  id: string;
  action_type: string;
  description: string;
  created_at: string;
};

type DashboardData = {
  profile: Profile | null;
  services: Service[];
  reviews: Review[];
  activities: ActivityItem[];
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [profileRes, servicesRes, reviewsRes, activityRes] = await Promise.all([
        apiRequest<Profile>('/api/profile'),
        apiRequest<Service[]>('/api/services'),
        apiRequest<Review[]>('/api/reviews'),
        apiRequest<ActivityItem[]>('/api/activity'),
      ]);

      if (profileRes.error) toast.error('Failed to load profile');
      if (servicesRes.error) toast.error('Failed to load services');
      if (reviewsRes.error) toast.error('Failed to load reviews');

      setData({
        profile: profileRes.data || null,
        services: Array.isArray(servicesRes.data) ? servicesRes.data : [],
        reviews: Array.isArray(reviewsRes.data) ? reviewsRes.data : [],
        activities: Array.isArray(activityRes.data) ? activityRes.data : [],
      });
      setLoading(false);
    }

    load();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  const enabledServices = data.services.filter((s) => s?.enabled);
  const visibleReviews = data.reviews.filter((r) => !r?.hidden);
  const avgRating =
    visibleReviews.length > 0
      ? visibleReviews.reduce((sum, r) => sum + (r?.rating || 0), 0) / visibleReviews.length
      : 0;
  const availConfig = getAvailabilityConfig(data.profile?.availability ?? 'offline');
  const recentReviews = data.reviews.slice(0, 5);

  const stats = [
    {
      label: 'Available Services',
      value: enabledServices.length.toString(),
      total: data.services.length,
      icon: Briefcase,
      gradient: 'from-primary to-accent',
    },
    {
      label: 'Total Reviews',
      value: visibleReviews.length.toString(),
      icon: Star,
      gradient: 'from-warning to-primary',
    },
    {
      label: 'Overall Rating',
      value: avgRating.toFixed(1),
      suffix: '/ 5',
      icon: TrendingUp,
      gradient: 'from-secondary to-primary',
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome header */}
      <div className="glass-card p-6 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
              Welcome, Admin
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Manage your profile, services, and settings
            </p>
          </div>
          <div
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-2 border',
              availConfig.bg,
              availConfig.color,
              availConfig.border
            )}
          >
            <span className={cn('w-2 h-2 rounded-full', availConfig.dot, 'animate-pulse')} />
            {availConfig.label}
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card p-5 animate-fade-in-up">
              <div
                className={cn(
                  'w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center mb-3',
                  stat.gradient
                )}
              >
                <Icon size={20} className="text-white" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white">{stat.value}</span>
                {stat.suffix && <span className="text-sm text-muted-foreground">{stat.suffix}</span>}
                {stat.total !== undefined && (
                  <span className="text-sm text-muted-foreground">/ {stat.total}</span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-5">
        <h2 className="font-display text-lg font-semibold text-white mb-4">Recent Activity</h2>
        {data.activities.length > 0 ? (
          <div className="space-y-3">
            {data.activities.map((act) => {
              const actDate = act.created_at ? new Date(act.created_at) : new Date();
              const timeStr = isNaN(actDate.getTime()) ? '' : actDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const dateStr = isNaN(actDate.getTime()) ? '' : actDate.toLocaleDateString();

              return (
                <div
                  key={act.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    <CircleDot size={14} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/90">{act.description}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {timeStr} {dateStr ? `• ${dateStr}` : ''}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : recentReviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity logged yet.</p>
        ) : (
          <div className="space-y-3">
            {recentReviews.map((review) => {
              const starCount = Math.max(0, Math.min(5, Math.floor(review?.rating || 0)));
              const reviewerName = review?.reviewer_name || 'Customer';

              return (
                <div
                  key={review.id}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {reviewerName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{reviewerName}</span>
                      <span className="text-xs text-warning">{'★'.repeat(starCount)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {review.review_text || 'No text'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
