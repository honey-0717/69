'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MapPin } from 'lucide-react';
import { type Profile } from '@/lib/supabase';
import { AvailabilityBadge } from './availability-badge';
import { cn } from '@/lib/utils';

export function ProfileHeader({
  profile: initialProfile,
  className,
}: {
  profile: Profile | null;
  className?: string;
}) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const router = useRouter();

  const tapCountRef = useRef<number>(0);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setProfile(initialProfile);
    router.prefetch('/admin/login');
  }, [initialProfile, router]);

  const handleAvatarTap = () => {
    tapCountRef.current += 1;

    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }

    if (tapCountRef.current === 5) {
      tapCountRef.current = 0;
      fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
        router.push('/admin/login');
      });
      return;
    }

    resetTimerRef.current = setTimeout(() => {
      tapCountRef.current = 0;
    }, 2000);
  };

  const displayName = profile?.display_name || 'HotHarini69';
  const bio =
    profile?.bio ||
    'Premium personal service provider. Available for video calls, voice calls, and exclusive content. Discrete, professional, and unforgettable experiences.';
  const photoUrl =
    !profile?.profile_photo ||
    profile.profile_photo.includes('unsplash') ||
    profile.profile_photo.includes('pexels')
      ? '/logo.jpg'
      : profile.profile_photo;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-white/10 bg-gradient-to-r from-[#17091a] via-[#140816] to-[#240b1e] shadow-2xl animate-fade-in-up',
        className
      )}
    >
      {/* Background glow effects */}
      <div className="absolute top-0 right-0 w-64 sm:w-80 h-64 sm:h-80 bg-[#ff2a85]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 sm:w-80 h-64 sm:h-80 bg-purple-900/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-8 text-center sm:text-left">
        {/* Avatar with Pink Ring Glow & Hidden 5-Tap Gesture */}
        <div
          className="relative shrink-0 w-28 h-28 xs:w-32 xs:h-32 sm:w-36 sm:h-36 rounded-full p-[2px] bg-gradient-to-tr from-[#ff2a85] to-[#ff60a8] shadow-[0_0_20px_rgba(255,42,133,0.35)] select-none cursor-pointer touch-manipulation overflow-hidden"
          onClick={handleAvatarTap}
        >
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <Image
              src={photoUrl}
              alt={displayName}
              width={144}
              height={144}
              className="w-full h-full object-cover pointer-events-none rounded-full"
              priority
            />
          </div>
        </div>

        {/* Info & Metadata */}
        <div className="flex-1 w-full">
          <h1 className="font-display text-2xl xs:text-3xl sm:text-4xl font-extrabold text-[#ff2a85] tracking-tight mb-2">
            {displayName}
          </h1>

          <p className="text-zinc-300/90 text-xs xs:text-sm sm:text-base leading-relaxed max-w-2xl mb-4 font-normal">
            {bio}
          </p>

          {/* Badges Row */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
            {/* Availability Pill */}
            <AvailabilityBadge status={profile?.availability || 'available'} />

            {/* Location Pill */}
            <div className="flex items-center gap-2 bg-[#1d1022]/80 border border-white/10 px-3 sm:px-3.5 py-1.5 rounded-full backdrop-blur-md">
              <MapPin size={15} className="text-[#ff2a85] shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-zinc-200">Online Only</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
