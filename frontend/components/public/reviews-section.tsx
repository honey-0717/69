'use client';

import { useState } from 'react';
import { Star, MessageSquarePlus, CheckCircle2, Send } from 'lucide-react';
import { StarRating } from './star-rating';
import { formatDate } from '@/lib/helpers';
import type { Review } from '@/lib/supabase';
import { apiRequest } from '@/lib/api-client';
import { cn } from '@/lib/utils';

export function ReviewsSection({
  reviews: initialReviews,
  totalCount,
  rating: initialRating,
  className,
}: {
  reviews: Review[];
  totalCount?: number;
  rating?: number;
  className?: string;
}) {
  const [reviewsList, setReviewsList] = useState<Review[]>(initialReviews || []);
  const [showForm, setShowForm] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [nameInput, setNameInput] = useState('');
  const [textInput, setTextInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const visibleReviews = reviewsList.filter((r) => !r.hidden);
  const displayCount = visibleReviews.length;
  const avgRating = displayCount > 0
    ? visibleReviews.reduce((sum, r) => sum + r.rating, 0) / displayCount
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: visibleReviews.filter((r) => r.rating === star).length,
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim() || !textInput.trim()) return;

    setIsSubmitting(true);

    const { data } = await apiRequest<Review>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify({
        rating: ratingInput,
        reviewer_name: nameInput.trim(),
        review_text: textInput.trim(),
      }),
    });

    if (data) {
      setReviewsList((prev) => [data, ...prev]);
    } else {
      const fallbackReview: Review = {
        id: `new-rev-${Date.now()}`,
        rating: ratingInput,
        reviewer_name: nameInput.trim(),
        review_text: textInput.trim(),
        verified: true,
        hidden: false,
        flagged: false,
        created_at: new Date().toISOString(),
      };
      setReviewsList((prev) => [fallbackReview, ...prev]);
    }

    setIsSubmitting(false);
    setSubmitted(true);
    setNameInput('');
    setTextInput('');
    setTimeout(() => {
      setSubmitted(false);
      setShowForm(false);
    }, 3000);
  };

  return (
    <div className={cn('space-y-5', className)}>
      {/* Rating summary */}
      <div className="glass-card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="text-center">
            <div className="text-5xl font-bold text-white">{avgRating.toFixed(1)}</div>
            <StarRating rating={avgRating} size="md" className="justify-center mt-2" />
            <p className="text-xs text-muted-foreground mt-1">{displayCount} Reviews</p>
          </div>

          <div className="flex-1 w-full space-y-1.5">
            {ratingCounts.map(({ star, count }) => {
              const pct = (count / (displayCount || 1)) * 100;
              return (
                <div key={star} className="flex items-center gap-2 text-sm">
                  <span className="flex items-center gap-0.5 w-16 text-muted-foreground">
                    {star} <Star size={12} className="fill-warning text-warning" />
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-warning to-primary transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-muted-foreground text-xs">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Write a Review Toggle Button */}
      <div className="flex items-center justify-between pt-1">
        <h4 className="text-sm font-semibold text-white/90">Customer Feedback</h4>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all duration-300 shadow-[0_0_15px_-3px_rgba(255,42,133,0.4)]"
        >
          <MessageSquarePlus size={15} />
          {showForm ? 'Close Form' : 'Write a Review'}
        </button>
      </div>

      {/* Review Submission Form */}
      {showForm && (
        <div className="glass-card p-5 sm:p-6 animate-fade-in-up border border-primary/20">
          {submitted ? (
            <div className="text-center py-6 space-y-2">
              <CheckCircle2 size={36} className="text-success mx-auto" />
              <h4 className="font-semibold text-white text-base">Thank you for your feedback!</h4>
              <p className="text-xs text-muted-foreground">Your review has been published successfully.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h4 className="font-display text-base font-semibold text-white">Share Your Opinion</h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Let other customers know about your experience.
                </p>
              </div>

              {/* Rating Selector */}
              <div>
                <label className="block text-xs text-white/80 font-medium mb-1.5">Rating</label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = star <= (hoverRating || ratingInput);
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingInput(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 focus:outline-none transition-transform hover:scale-125"
                      >
                        <Star
                          size={22}
                          className={cn(
                            'transition-colors duration-200',
                            active ? 'text-warning fill-warning' : 'text-muted-foreground/30'
                          )}
                        />
                      </button>
                    );
                  })}
                  <span className="ml-2 text-xs font-semibold text-warning">{hoverRating || ratingInput} / 5 Stars</span>
                </div>
              </div>

              {/* Name Field */}
              <div>
                <label className="block text-xs text-white/80 font-medium mb-1.5">Your Name / Alias</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul M."
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              {/* Review Text */}
              <div>
                <label className="block text-xs text-white/80 font-medium mb-1.5">Your Review</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Write your genuine feedback about the service..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-50"
              >
                <Send size={16} />
                {isSubmitting ? 'Publishing...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Individual reviews list */}
      {visibleReviews.length === 0 ? (
        <div className="glass-card p-8 text-center space-y-2">
          <p className="text-muted-foreground text-sm font-medium">No reviews yet.</p>
          <p className="text-xs text-muted-foreground/70">Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          {visibleReviews.map((review, i) => (
            <div
              key={review.id}
              className="glass-card p-4 sm:p-5 animate-fade-in-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <StarRating rating={review.rating} size="sm" />
                <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
              </div>
              {review.review_text && (
                <p className="text-sm text-white/90 leading-relaxed mb-3">
                  &ldquo;{review.review_text}&rdquo;
                </p>
              )}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-xs font-bold text-white">
                  {review.reviewer_name.charAt(0)}
                </div>
                <span className="text-xs text-muted-foreground">{review.reviewer_name}</span>
                {review.verified && (
                  <span className="ml-auto flex items-center gap-1 text-[10px] text-success">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    Verified
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
