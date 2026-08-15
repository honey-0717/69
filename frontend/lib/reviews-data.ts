import type { Review } from './supabase';

export function getServiceReviewStats(serviceId?: string, reviews: Review[] = []) {
  const visible = reviews.filter((r) => !r.hidden);

  if (visible.length === 0) {
    return { count: 0, rating: 0.0 };
  }

  const count = visible.length;
  const rating = visible.reduce((sum, r) => sum + r.rating, 0) / count;

  return { count, rating };
}

export function getServiceReviews(
  serviceId?: string,
  baseReviews: Review[] = []
): { reviews: Review[]; count: number; rating: number } {
  const visible = baseReviews.filter((r) => !r.hidden);
  const stats = getServiceReviewStats(serviceId, baseReviews);

  return {
    reviews: visible,
    count: stats.count,
    rating: stats.rating,
  };
}
