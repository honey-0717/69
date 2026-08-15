'use client';

import React from 'react';
import { CreditCard, Landmark, Coins } from 'lucide-react';

export function PaymentLogo({ name, className = 'w-8 h-8' }: { name: string; className?: string }) {
  const lower = name.toLowerCase().trim();

  // 1. PhonePe / Phonepy
  if (lower.includes('phonepe') || lower.includes('phone pe') || lower.includes('phonepy')) {
    return (
      <div className={`rounded-xl bg-[#5f259f] flex items-center justify-center p-0.5 shadow-md shrink-0 ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <rect width="100" height="100" rx="24" fill="#5f259f" />
          <text
            x="50"
            y="68"
            fontSize="54"
            fontWeight="bold"
            textAnchor="middle"
            fill="#ffffff"
            fontFamily="Arial, system-ui, sans-serif"
          >
            पे
          </text>
        </svg>
      </div>
    );
  }

  // 2. Google Pay / GPay
  if (lower.includes('google pay') || lower.includes('gpay') || lower.includes('g pay')) {
    return (
      <div className={`rounded-xl bg-white flex items-center justify-center p-1.5 shadow-sm shrink-0 ${className}`}>
        <svg viewBox="0 0 24 24" className="w-full h-full">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
      </div>
    );
  }

  // 3. Paytm
  if (lower.includes('paytm')) {
    return (
      <div className={`rounded-xl bg-[#002E6E] flex items-center justify-center p-1.5 shadow-sm text-white shrink-0 ${className}`}>
        <span className="font-extrabold text-[11px] tracking-tighter text-[#00B9F1]">Pay<span className="text-white">tm</span></span>
      </div>
    );
  }

  // 4. BHIM / UPI
  if (lower.includes('upi') || lower.includes('bhim')) {
    return (
      <div className={`rounded-xl bg-gradient-to-r from-[#FF9933] via-white to-[#138808] flex items-center justify-center p-[2px] shadow-sm shrink-0 ${className}`}>
        <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
          <span className="font-black text-[11px] tracking-tight bg-gradient-to-r from-[#FF9933] to-[#138808] bg-clip-text text-transparent">UPI</span>
        </div>
      </div>
    );
  }

  // 5. PayPal
  if (lower.includes('paypal')) {
    return (
      <div className={`rounded-xl bg-[#003087] flex items-center justify-center p-1.5 shadow-sm text-white shrink-0 ${className}`}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.72a.761.761 0 0 1 .752-.64h6.589c3.082 0 5.485.666 6.46 2.01.91 1.258.9 2.964.062 4.947-.98 2.316-2.73 3.963-5.2 4.896-.75.283-1.604.425-2.54.425H8.718l-1.642 5.979z"/>
        </svg>
      </div>
    );
  }

  // 6. Bank Transfer
  if (lower.includes('bank') || lower.includes('imps') || lower.includes('neft')) {
    return (
      <div className={`rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center p-1.5 text-amber-400 shrink-0 ${className}`}>
        <Landmark className="w-full h-full" />
      </div>
    );
  }

  // 7. Crypto / USDT / BTC
  if (lower.includes('crypto') || lower.includes('usdt') || lower.includes('btc')) {
    return (
      <div className={`rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center p-1.5 text-emerald-400 shrink-0 ${className}`}>
        <Coins className="w-full h-full" />
      </div>
    );
  }

  // Default fallback
  return (
    <div className={`rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center p-1.5 text-white shrink-0 ${className}`}>
      <CreditCard className="w-full h-full" />
    </div>
  );
}
