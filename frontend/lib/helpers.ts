import type { SocialContact } from './supabase';

export function buildContactUrl(
  platform: 'whatsapp' | 'instagram' | 'telegram' | 'snapchat' | string,
  value: string,
  message: string
): string {
  switch (platform) {
    case 'whatsapp': {
      const cleanNumber = value.replace(/[^0-9]/g, '');
      return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
    }
    case 'instagram':
      return `https://instagram.com/${value.replace(/^@/, '')}`;
    case 'telegram': {
      const cleanUsername = value.replace(/^@/, '');
      return `https://t.me/${cleanUsername}`;
    }
    case 'snapchat': {
      const cleanUsername = value.replace(/^@/, '');
      return `https://snapchat.com/add/${cleanUsername}`;
    }
    default:
      return '#';
  }
}

export function fillTemplate(
  template: string,
  service: { name: string; duration: string | number; price: number }
): string {
  if (!template) return '';

  const rawName = service?.name || 'Service';
  
  let formattedDuration = service?.duration ? String(service.duration) : '';
  if (/^\d+$/.test(formattedDuration)) {
    formattedDuration = `${formattedDuration} Minutes`;
  }

  const rawPrice = service?.price !== undefined && service?.price !== null ? service.price : 0;
  const formattedPrice = `₹${rawPrice.toLocaleString('en-IN')}`;

  let result = template;
  result = result.replace(/\[Service Name\]/gi, rawName);
  result = result.replace(/\[Duration\]/gi, formattedDuration);

  // Handle ₹[Price] or [Price] safely without producing double ₹₹
  if (result.includes('₹[Price]') || result.includes('₹[price]')) {
    result = result.replace(/₹\[Price\]/gi, formattedPrice);
  } else {
    result = result.replace(/\[Price\]/gi, formattedPrice);
  }

  return result;
}

export function getSocialIcon(platform: string) {
  const icons: Record<string, string> = {
    whatsapp: 'MessageCircle',
    instagram: 'Instagram',
    telegram: 'Send',
    snapchat: 'Ghost',
  };
  return icons[platform] || 'MessageCircle';
}

export function formatRating(rating: number | null | undefined): string {
  if (rating === null || rating === undefined) return 'N/A';
  return rating.toFixed(1);
}

export function formatPrice(price: number): string {
  return `₹${price.toLocaleString('en-IN')}`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getAvailabilityConfig(status: 'available' | 'busy' | 'offline') {
  const configs = {
    available: {
      label: 'Available',
      color: 'text-success',
      bg: 'bg-success/10',
      dot: 'bg-success',
      border: 'border-success/30',
    },
    busy: {
      label: 'Busy',
      color: 'text-error',
      bg: 'bg-error/10',
      dot: 'bg-error',
      border: 'border-error/30',
    },
    offline: {
      label: 'Offline',
      color: 'text-muted-foreground',
      bg: 'bg-muted/10',
      dot: 'bg-muted-foreground',
      border: 'border-muted/30',
    },
  };
  return configs[status];
}

export function getEnabledContacts(
  contacts: SocialContact[]
): SocialContact[] {
  return contacts.filter((c) => c.enabled);
}
