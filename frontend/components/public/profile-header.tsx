'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { MapPin, ShieldCheck, Sparkles, Video, Phone, Lock, Zap } from 'lucide-react';
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
        'relative overflow-hidden rounded-3xl p-5 sm:p-8 border border-white/15 bg-gradient-to-br from-[#1b061d] via-[#120516] to-[#280a26] shadow-[0_0_50px_rgba(255,42,133,0.15)] animate-fade-in-up',
        className
      )}
    >
      {/* Background ambient mesh & glows */}
      <div className="absolute -top-16 -right-16 w-56 sm:w-96 h-56 sm:h-96 bg-gradient-to-br from-primary/30 to-accent/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 sm:w-96 h-56 sm:h-96 bg-purple-900/40 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,42,133,0.08),transparent_50%)] pointer-events-none" />

      <div className="relative flex flex-col items-center text-center sm:text-left sm:flex-row sm:items-start gap-5 sm:gap-8">
        {/* Avatar Container with Golden-Pink Neon Ring & Verified Badge */}
        <div className="relative shrink-0 group">
          <div
            className="relative w-28 h-28 sm:w-40 sm:h-40 rounded-full p-[4px] bg-gradient-to-tr from-[#ff2a85] via-[#ffd700] to-[#ff509e] shadow-[0_0_35px_rgba(255,42,133,0.5)] select-none cursor-pointer touch-manipulation overflow-hidden active:scale-95 transition-transform duration-300 ring-4 ring-primary/20"
            onClick={handleAvatarTap}
          >
            <div className="relative w-full h-full rounded-full overflow-hidden bg-black">
              <Image
                src={photoUrl}
                alt={displayName}
                width={160}
                height={160}
                className="w-full h-full object-cover pointer-events-none rounded-full group-hover:scale-105 transition-transform duration-500"
                priority
              />
            </div>
          </div>

          {/* Verified Host Badge overlay */}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 sm:translate-x-0 sm:left-auto sm:-right-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg border border-white/20 uppercase tracking-wider">
            <ShieldCheck size={12} className="text-white fill-white/20" />
            Verified
          </div>
        </div>

        {/* Info & Content Block */}
        <div className="flex-1 w-full min-w-0">
          {/* Title & Tagline */}
          <div className="flex flex-col items-center sm:items-start mb-2">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-3xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-[#ff3b94] via-[#ff85c0] to-[#ffd700] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(255,42,133,0.5)]">
                {displayName}
              </h1>
              <Sparkles size={22} className="text-amber-400 shrink-0 animate-pulse" />
            </div>
            <span className="text-xs font-semibold text-primary/90 uppercase tracking-widest mt-0.5">
              VIP Personal Host & Content Creator
            </span>
          </div>

          {/* Luxury Description Card */}
          <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 p-3.5 sm:p-4.5 rounded-2xl my-3 shadow-inner text-left">
            <p className="text-white/90 text-xs sm:text-sm leading-relaxed font-normal">
              {bio}
            </p>

            {/* Quick Feature Badges Grid */}
            <div className="grid grid-cols-2 xs:grid-cols-4 gap-1.5 sm:gap-2 mt-3 pt-3 border-t border-white/10 text-[10px] sm:text-xs">
              <div className="flex items-center gap-1.5 text-pink-300/90 font-medium">
                <Video size={13} className="text-primary shrink-0" />
                <span>Video Calls</span>
              </div>
              <div className="flex items-center gap-1.5 text-purple-300/90 font-medium">
                <Phone size={13} className="text-accent shrink-0" />
                <span>Voice Calls</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-300/90 font-medium">
                <Lock size={13} className="text-amber-400 shrink-0" />
                <span>100% Private</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-300/90 font-medium">
                <Zap size={13} className="text-emerald-400 shrink-0" />
                <span>Instant Booking</span>
              </div>
            </div>
          </div>

          {/* Badges Row */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-3 mt-3">
            {/* Live Availability Status */}
            <AvailabilityBadge status={profile?.availability || 'available'} />

            {/* Location Pill */}
            <div className="flex items-center gap-1.5 bg-[#1f0d26]/90 border border-white/15 px-3 py-1.5 rounded-full backdrop-blur-md shadow-sm">
              <MapPin size={13} className="text-primary shrink-0 animate-bounce" />
              <span className="text-xs font-semibold text-white/90">Online Only (Worldwide)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
