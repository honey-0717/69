'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock, ArrowRight, Star } from 'lucide-react';
import type { Service, Category, Review } from '@/lib/supabase';
import { formatPrice } from '@/lib/helpers';
import { getServiceReviewStats } from '@/lib/reviews-data';
import { cn } from '@/lib/utils';

export function ServiceCard({
  service,
  category,
  reviews = [],
  className,
}: {
  service: Service;
  category?: Category | null;
  reviews?: Review[];
  className?: string;
}) {
  const photo = service.photos?.[0];
  const stats = getServiceReviewStats(service.id, reviews);

  return (
    <Link
      href={`/service/${service.id}`}
      prefetch={true}
      className={cn(
        'group relative block w-full glass-card-hover overflow-hidden animate-fade-in-up transition-transform duration-200 active:scale-[0.97] cursor-pointer touch-manipulation',
        className
      )}
    >
      <div className="relative w-full aspect-[4/5] overflow-hidden bg-white/5">
        {photo ? (
          <Image
            src={photo}
            alt={service.name}
            width={400}
            height={500}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

        {category && (
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10">
            <span className="glass px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-medium text-white/90 uppercase tracking-wider">
              {category.name}
            </span>
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-4 z-10">
          <h3 className="font-display text-xs sm:text-base font-bold text-white mb-1 line-clamp-2 leading-snug">
            {service.name}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-xs sm:text-sm">
            <span className="text-primary font-extrabold">{formatPrice(service.price)}</span>
            <span className="flex items-center gap-1 text-white/70 text-[10px] sm:text-xs">
              <Clock size={11} />
              {service.duration}
            </span>
          </div>
        </div>
      </div>

      <div className="px-2.5 sm:px-4 py-2 sm:py-3 flex items-center justify-between bg-black/40">
        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-muted-foreground">
          <Star size={11} className="text-warning fill-warning" />
          <span className="text-white/90 font-semibold">{stats.rating.toFixed(1)}</span>
          <span className="text-muted-foreground">({stats.count})</span>
        </div>
        <span className="flex items-center gap-0.5 sm:gap-1 text-[10px] sm:text-xs text-primary group-hover:gap-1.5 transition-all duration-300 font-semibold">
          Book
          <ArrowRight size={12} />
        </span>
      </div>
    </Link>
  );
}
