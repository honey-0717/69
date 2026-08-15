'use client';

import { MessageCircle, Instagram, Send, Ghost, Lock } from 'lucide-react';
import type { SocialContact } from '@/lib/supabase';
import { cn } from '@/lib/utils';

const platformConfig = {
  whatsapp: {
    label: 'WhatsApp',
    icon: MessageCircle,
    gradient: 'from-[#25D366] to-[#128C7E]',
    glow: 'shadow-[0_0_25px_-5px_rgba(37,211,102,0.5)]',
  },
  instagram: {
    label: 'Instagram',
    icon: Instagram,
    gradient: 'from-[#E1306C] to-[#F77737]',
    glow: 'shadow-[0_0_25px_-5px_rgba(225,48,108,0.5)]',
  },
  telegram: {
    label: 'Telegram',
    icon: Send,
    gradient: 'from-[#0088cc] to-[#29b6f6]',
    glow: 'shadow-[0_0_25px_-5px_rgba(0,136,204,0.5)]',
  },
  snapchat: {
    label: 'Snapchat',
    icon: Ghost,
    gradient: 'from-[#FFFC00] to-[#E6E300] text-black font-bold',
    glow: 'shadow-[0_0_25px_-5px_rgba(255,252,0,0.6)]',
  },
};

export function ContactButtons({
  contacts,
  message,
  disabled,
  className,
}: {
  contacts: SocialContact[];
  message: string;
  disabled: boolean;
  className?: string;
}) {
  const defaultContacts: SocialContact[] = [
    { id: 'sc-whatsapp', platform: 'whatsapp', value: '+919999999999', enabled: true, updated_at: '' },
    { id: 'sc-instagram', platform: 'instagram', value: 'hotharini69', enabled: true, updated_at: '' },
    { id: 'sc-telegram', platform: 'telegram', value: 'hotharini69', enabled: true, updated_at: '' },
    { id: 'sc-snapchat', platform: 'snapchat', value: 'hotharini69', enabled: true, updated_at: '' },
  ];

  const activeContacts = Array.isArray(contacts) && contacts.length > 0 ? contacts : defaultContacts;
  const visibleContacts = activeContacts.filter((c) => c.enabled !== false);

  if (visibleContacts.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="text-center">
        <h3 className="font-display text-xl font-bold text-white flex items-center justify-center gap-2">
          <span>📩</span> Book / Contact
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Choose an available platform to send your booking request
        </p>
      </div>

      <div className="grid gap-3">
        {visibleContacts.map((contact: any) => {
          const rawKey = (contact.platform || contact.type || contact.name || '').toString().toLowerCase();
          const platformKey = (
            rawKey.includes('whatsapp') ? 'whatsapp' :
            rawKey.includes('instagram') ? 'instagram' :
            rawKey.includes('telegram') ? 'telegram' :
            rawKey.includes('snapchat') ? 'snapchat' :
            'whatsapp'
          ) as keyof typeof platformConfig;
          const config = platformConfig[platformKey] || platformConfig.whatsapp;
          const Icon = config.icon;
          const url = buildUrl(platformKey, contact.value || '', message);

          return (
            <a
              key={contact.id || platformKey}
              href={disabled ? undefined : url}
              target={disabled ? undefined : '_blank'}
              rel={disabled ? undefined : 'noopener noreferrer'}
              aria-disabled={disabled}
              className={cn(
                'group relative flex items-center justify-center gap-3 py-3.5 rounded-2xl font-semibold transition-all duration-300',
                platformKey === 'snapchat' ? 'text-black font-bold' : 'text-white',
                'bg-gradient-to-r hover:scale-[1.02] active:scale-[0.98]',
                config.gradient,
                !disabled && config.glow,
                disabled && 'opacity-40 grayscale cursor-not-allowed pointer-events-none'
              )}
            >
              {disabled && <Lock size={16} className="absolute left-4" />}
              <Icon size={20} />
              {config.label}
            </a>
          );
        })}
      </div>

      {disabled && (
        <p className="text-center text-xs text-muted-foreground flex items-center justify-center gap-1.5">
          <Lock size={12} />
          Agree to the Terms &amp; Conditions to unlock contact options
        </p>
      )}
    </div>
  );
}

function buildUrl(
  platform: string,
  value: string,
  message: string
): string {
  const p = platform.toLowerCase();
  const encodedMsg = encodeURIComponent(message || '');
  if (p.includes('whatsapp')) {
    const cleanNumber = value.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanNumber}?text=${encodedMsg}`;
  }
  if (p.includes('instagram')) {
    return `https://instagram.com/${value.replace(/^@/, '')}`;
  }
  if (p.includes('telegram')) {
    const cleanUsername = value.replace(/^@/, '');
    return `https://t.me/${cleanUsername}?text=${encodedMsg}`;
  }
  if (p.includes('snapchat')) {
    const cleanUsername = value.replace(/^@/, '');
    return `https://snapchat.com/add/${cleanUsername}`;
  }
  return value.startsWith('http') ? value : `https://${value}`;
}
