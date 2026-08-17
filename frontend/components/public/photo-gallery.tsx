'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling when lightbox is open
  useEffect(() => {
    if (lightbox) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [lightbox]);

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
      <div className={cn('relative group w-full h-full min-h-[320px] sm:min-h-[450px]', className)}>
        <div
          className="relative w-full h-full overflow-hidden rounded-3xl cursor-pointer bg-black/80 border border-white/10"
          onClick={() => setLightbox(true)}
        >
          {/* Ambient Blurred Background */}
          <Image
            src={photos[activeIndex]}
            alt=""
            fill
            className="object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
          />
          {/* 100% Full Uncropped Image */}
          <Image
            src={photos[activeIndex]}
            alt={`${name} photo ${activeIndex + 1}`}
            fill
            className="object-contain transition-transform duration-500 group-hover:scale-[1.02] relative z-10"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />

          {/* Fullscreen Expand Hint Badge */}
          <div className="absolute top-3 right-3 z-20 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-[11px] font-semibold text-white border border-white/20 shadow-lg">
              <Maximize2 size={13} className="text-primary" />
              Full View
            </span>
          </div>
        </div>

        {hasMultiple && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full glass flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 hover:bg-white/20 z-20"
              aria-label="Previous photo"
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-full glass flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 hover:bg-white/20 z-20"
              aria-label="Next photo"
            >
              <ChevronRight size={20} className="text-white" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
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

      {/* Fullscreen Lightbox via Portal (attached to document.body to avoid stacking context issues) */}
      {lightbox && mounted && createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-md flex items-center justify-center animate-fade-in p-2 sm:p-6"
          onClick={() => setLightbox(false)}
        >
          {/* Top Close Button */}
          <button
            className="absolute top-4 right-4 z-[100000] w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white transition-all shadow-2xl"
            onClick={(e) => { e.stopPropagation(); setLightbox(false); }}
            aria-label="Close"
          >
            <X size={22} />
          </button>

          {/* Full Screen Image Container */}
          <div
            className="relative w-full max-w-5xl h-full max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={photos[activeIndex]}
              alt={`${name} full photo ${activeIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {hasMultiple && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-[100000] w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white transition-all shadow-2xl"
                aria-label="Previous"
              >
                <ChevronLeft size={26} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-[100000] w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white transition-all shadow-2xl"
                aria-label="Next"
              >
                <ChevronRight size={26} />
              </button>
            </>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
