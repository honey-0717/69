'use client';

import { useEffect, useState } from 'react';
import type { Review } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/public/star-rating';
import { Star, Flag, EyeOff, Eye, Loader2 } from 'lucide-react';
import { formatDate } from '@/lib/helpers';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/api-client';

import { logAdminActivity } from '@/lib/activity';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'hidden' | 'flagged'>('all');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await apiRequest<Review[]>('/api/reviews');
    setReviews(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function toggleHidden(review: Review) {
    const nextState = !review.hidden;
    setReviews((prev) =>
      prev.map((r) => (r.id === review.id ? { ...r, hidden: nextState } : r))
    );

    const { data, error } = await apiRequest<Review>(`/api/reviews/${review.id}/hide`, {
      method: 'PATCH',
    });
    if (error) {
      toast.error('Failed to update review: ' + error);
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, hidden: review.hidden } : r))
      );
    } else {
      toast.success(nextState ? 'Review hidden' : 'Review shown');
      logAdminActivity('review_moderated', `${nextState ? 'Hidden' : 'Unhidden'} customer review (${review.rating}★)`, { id: review.id, hidden: nextState });
    }
  }

  async function toggleFlagged(review: Review) {
    const nextState = !review.flagged;
    setReviews((prev) =>
      prev.map((r) => (r.id === review.id ? { ...r, flagged: nextState } : r))
    );

    const { data, error } = await apiRequest<Review>(`/api/reviews/${review.id}/flag`, {
      method: 'PATCH',
    });
    if (error) {
      toast.error('Failed to flag review: ' + error);
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, flagged: review.flagged } : r))
      );
    } else {
      toast.success(nextState ? 'Review flagged' : 'Flag removed');
      logAdminActivity('review_moderated', `${nextState ? 'Flagged' : 'Unflagged'} customer review`, { id: review.id, flagged: nextState });
    }
  }

  const safeReviews = Array.isArray(reviews) ? reviews : [];

  const filtered = safeReviews.filter((r) => {
    if (filter === 'hidden') return r?.hidden;
    if (filter === 'flagged') return r?.flagged;
    return true;
  });

  const visibleReviews = safeReviews.filter((r) => !r?.hidden);
  const avgRating = visibleReviews.length > 0
    ? visibleReviews.reduce((sum, r) => sum + (r?.rating || 0), 0) / visibleReviews.length
    : 0;
  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: safeReviews.filter((r) => Math.floor(r?.rating || 0) === star).length,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Reviews</h1>
        <p className="text-sm text-muted-foreground mt-0.5">View and moderate customer reviews</p>
      </div>

      {/* Summary */}
      <div className="glass-card p-5">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-white">{avgRating.toFixed(1)}</div>
            <StarRating rating={avgRating} size="sm" className="justify-center mt-1" />
            <p className="text-xs text-muted-foreground mt-1">{visibleReviews.length} visible</p>
          </div>
          <div className="flex-1 w-full space-y-1.5">
            {ratingCounts.map(({ star, count }) => {
              const pct = safeReviews.length > 0 ? (count / safeReviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="flex items-center gap-0.5 w-12 text-muted-foreground">
                    {star} <Star size={12} className="fill-warning text-warning" />
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-warning to-primary" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-8 text-right text-muted-foreground text-xs">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'hidden', 'flagged'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              filter === f
                ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-white border border-primary/30'
                : 'glass text-muted-foreground hover:text-white'
            )}
          >
            {f === 'all' ? `All (${safeReviews.length})` : f === 'hidden' ? `Hidden (${safeReviews.filter(r => r?.hidden).length})` : `Flagged (${safeReviews.filter(r => r?.flagged).length})`}
          </button>
        ))}
      </div>

      {/* Reviews list */}
      <div className="space-y-3">
        {filtered.map((review) => (
          <div key={review.id} className="glass-card p-4 animate-fade-in-up">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 mb-2">
                  <StarRating rating={review.rating || 5} size="sm" />
                  <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                  {review.verified && (
                    <span className="text-[10px] text-success flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                      Verified
                    </span>
                  )}
                  {review.hidden && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/20 text-muted-foreground">Hidden</span>
                  )}
                  {review.flagged && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-error/20 text-error">Flagged</span>
                  )}
                </div>
                {review.review_text && (
                  <p className="text-sm text-white/90 leading-relaxed mb-2">&ldquo;{review.review_text}&rdquo;</p>
                )}
                <p className="text-xs text-muted-foreground">{review.reviewer_name || 'Customer'}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg gap-1.5"
                  onClick={() => toggleFlagged(review)}
                >
                  <Flag size={14} className={review.flagged ? 'text-error' : 'text-muted-foreground'} />
                  <span className="hidden sm:inline text-xs">{review.flagged ? 'Unflag' : 'Flag'}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-lg gap-1.5"
                  onClick={() => toggleHidden(review)}
                >
                  {review.hidden ? <Eye size={14} className="text-muted-foreground" /> : <EyeOff size={14} className="text-muted-foreground" />}
                  <span className="hidden sm:inline text-xs">{review.hidden ? 'Show' : 'Hide'}</span>
                </Button>
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="glass-card p-12 text-center">
            <p className="text-muted-foreground text-sm">No reviews yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
