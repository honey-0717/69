import type {
  Profile,
  Category,
  Service,
  Review,
  PaymentMethod,
  SocialContact,
  Terms,
  MessageTemplate,
} from './supabase';
import {
  INITIAL_CATEGORIES,
  INITIAL_SERVICES,
  INITIAL_SOCIAL_CONTACTS,
  INITIAL_REVIEWS,
} from './initial-data';

export type PublicData = {
  profile: Profile | null;
  categories: Category[];
  services: Service[];
  reviews: Review[];
  paymentMethods: PaymentMethod[];
  socialContacts: SocialContact[];
  terms: Terms | null;
  messageTemplate: MessageTemplate | null;
};

export async function getPublicData(): Promise<PublicData> {
  const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || process.env.BACKEND_URL || 'http://localhost:5000';
  const url = typeof window === 'undefined' ? `${BACKEND_URL}/api/public-data` : '/api/public-data';

  try {
    const res = await fetch(url, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch public data: status ${res.status}`);
    }

    const data = await res.json();
    const categories = Array.isArray(data.categories) && data.categories.length > 0
      ? data.categories
      : (INITIAL_CATEGORIES as Category[]);

    const services = Array.isArray(data.services) && data.services.length > 0
      ? data.services
      : (INITIAL_SERVICES as Service[]);

    return {
      profile: data.profile ?? null,
      categories,
      services,
      reviews: data.reviews ?? [],
      paymentMethods: data.paymentMethods ?? [],
      socialContacts: Array.isArray(data.socialContacts) && data.socialContacts.length > 0
        ? data.socialContacts
        : (INITIAL_SOCIAL_CONTACTS as SocialContact[]),
      terms: data.terms ?? null,
      messageTemplate: data.messageTemplate ?? null,
    };
  } catch (err: any) {
    const isConnRefused = err?.code === 'ECONNREFUSED' || err?.cause?.code === 'ECONNREFUSED' || String(err).includes('ECONNREFUSED');
    if (!isConnRefused) {
      console.warn('Backend API fetch notice (using fallback):', err?.message || err);
    }
    return {
      profile: null,
      categories: INITIAL_CATEGORIES as Category[],
      services: INITIAL_SERVICES as Service[],
      reviews: INITIAL_REVIEWS as Review[],
      paymentMethods: [],
      socialContacts: INITIAL_SOCIAL_CONTACTS as SocialContact[],
      terms: null,
      messageTemplate: null,
    };
  }
}
