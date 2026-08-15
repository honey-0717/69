'use client';

import { cn } from '@/lib/utils';

export function AvailabilityBadge({
  status = 'available',
  className,
  showDot = true,
}: {
  status?: 'available' | 'busy' | 'offline';
  className?: string;
  showDot?: boolean;
}) {
  const isAvailable = status === 'available';
  const isBusy = status === 'busy';

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md border shadow-md transition-all',
        isAvailable && 'bg-[#091510]/90 border-emerald-500/40 text-emerald-400',
        isBusy && 'bg-[#18120b]/90 border-amber-500/40 text-amber-400',
        !isAvailable && !isBusy && 'bg-[#121215]/90 border-zinc-500/40 text-zinc-400',
        className
      )}
    >
      {showDot && (
        <span
          className={cn(
            'w-2 h-2 rounded-full shrink-0',
            isAvailable && 'bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse',
            isBusy && 'bg-amber-500 shadow-[0_0_8px_#f59e0b]',
            !isAvailable && !isBusy && 'bg-zinc-500'
          )}
        />
      )}
      <span className="capitalize">{status || 'Available'}</span>
    </div>
  );
}

