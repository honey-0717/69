'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PhotoGallery({
  photos,
  name,
  className,
}: {
  photos: string[];
  name: string;
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (photos.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl',
          className
        )}
      >
        <span className="text-muted-foreground text-sm">No photos available</span>
      </div>
    );
  }

  const hasMultiple = photos.length > 1;

  const goPrev = () => setActiveIndex((i) => (i === 0 ? photos.length - 1 : i - 1));
  const goNext = () => setActiveIndex((i) => (i === photos.length - 1 ? 0 : i + 1));

  return (
    <>
      <div className={cn('relative group', className)}>
        <div
          className="relative w-full h-full overflow-hidden rounded-3xl cursor-pointer"
          onClick={() => setLightbox(true)}
        >
          <Image
            src={photos[activeIndex]}
            alt={`${name} photo ${activeIndex + 1}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        </div>

        {hasMultiple && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full glass flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 hover:bg-white/20 z-10"
              aria-label="Previous photo"
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full glass flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 hover:bg-white/20 z-10"
              aria-label="Next photo"
            >
              <ChevronRight size={20} className="text-white" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-300',
                    i === activeIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/40'
                  )}
                  aria-label={`Go to photo ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center animate-fade-in"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 rounded-full glass flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            onClick={() => setLightbox(false)}
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <div className="relative w-full max-w-4xl h-full max-h-[80vh] m-4">
            <Image
              src={photos[activeIndex]}
              alt={`${name} photo ${activeIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          {hasMultiple && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                aria-label="Next"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
