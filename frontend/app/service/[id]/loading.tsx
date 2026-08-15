import { ChevronLeft } from 'lucide-react';

export default function ServiceLoading() {
  return (
    <main className="relative min-h-screen">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 animate-pulse">
        {/* Back link skeleton */}
        <div className="inline-flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
          <ChevronLeft size={16} />
          <span>Back to all services</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Left: Gallery Skeleton */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="aspect-[4/5] w-full rounded-3xl bg-white/10 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
            </div>
          </div>

          {/* Right: Details Skeleton */}
          <div className="space-y-5">
            {/* Category & Title Skeleton */}
            <div className="space-y-3">
              <div className="w-24 h-6 rounded-full bg-white/10" />
              <div className="w-3/4 h-9 sm:h-10 rounded-xl bg-white/10" />
              <div className="flex items-center gap-4 pt-1">
                <div className="w-28 h-8 rounded-lg bg-primary/20" />
                <div className="w-20 h-6 rounded-lg bg-white/10" />
              </div>
              <div className="w-40 h-5 rounded bg-white/10" />
            </div>

            {/* Short description skeleton */}
            <div className="space-y-2 pt-2">
              <div className="w-full h-4 rounded bg-white/10" />
              <div className="w-5/6 h-4 rounded bg-white/10" />
            </div>

            {/* Full details skeleton card */}
            <div className="glass-card p-5 space-y-3">
              <div className="w-32 h-5 rounded bg-white/10" />
              <div className="w-full h-4 rounded bg-white/10" />
              <div className="w-4/5 h-4 rounded bg-white/10" />
              <div className="w-2/3 h-4 rounded bg-white/10" />
            </div>

            {/* Payment methods skeleton */}
            <div className="glass-card p-5 space-y-3">
              <div className="w-36 h-5 rounded bg-white/10" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <div className="h-10 rounded-xl bg-white/10" />
                <div className="h-10 rounded-xl bg-white/10" />
                <div className="h-10 rounded-xl bg-white/10" />
              </div>
            </div>

            {/* Action buttons skeleton */}
            <div className="space-y-3 pt-2">
              <div className="h-12 w-full rounded-2xl bg-primary/30" />
              <div className="h-12 w-full rounded-2xl bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
