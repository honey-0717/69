import fs from 'fs';
import path from 'path';
import { adminSupabase } from './db';
import { broadcastChange } from './events';
import { syncServiceToGoogleSheet, deleteServiceFromGoogleSheet } from './google-sheets-sync';
import {
  INITIAL_CATEGORIES,
  INITIAL_SERVICES,
  INITIAL_SOCIAL_CONTACTS,
  INITIAL_REVIEWS,
  DEFAULT_TERMS,
} from './initial-data';

interface DatabaseStore {
  profile: any;
  categories: any[];
  services: any[];
  reviews: any[];
  paymentMethods: any[];
  socialContacts: any[];
  terms: any;
  messageTemplate: any;
  users: any[];
}

const DATA_DIR = path.join(__dirname, '..', 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

export let store: DatabaseStore = {
  profile: {
    id: '00000000-0000-0000-0000-000000000001',
    display_name: 'hotharini69',
    bio: 'hotharini69 info',
    languages: ['English', 'Hindi'],
    profile_photo: '/logo.jpg',
    availability: 'available',
    overall_rating: 4.8,
    updated_at: new Date().toISOString(),
  },
  categories: INITIAL_CATEGORIES,
  services: INITIAL_SERVICES,
  reviews: INITIAL_REVIEWS,
  paymentMethods: [
    { id: 'pay-phonepe', name: 'PhonePe', enabled: true, position: 0 },
    { id: 'pay-gpay', name: 'Google Pay', enabled: true, position: 1 },
    { id: 'pay-paytm', name: 'Paytm', enabled: true, position: 2 },
    { id: 'pay-upi', name: 'UPI', enabled: true, position: 3 },
    { id: 'pay-paypal', name: 'PayPal', enabled: true, position: 4 },
  ],
  socialContacts: INITIAL_SOCIAL_CONTACTS,
  terms: {
    id: 'terms-default',
    content: DEFAULT_TERMS,
    updated_at: new Date().toISOString(),
  },
  messageTemplate: {
    id: 'template-default',
    template: "Hello hotharini69! I would like to book the following service:\n\nService: [Service Name]\nDuration: [Duration]\nPrice: ₹[Price]\n\nI have read and accepted all rules and terms.",
    updated_at: new Date().toISOString(),
  },
  users: [
    {
      id: 'user-1786703134131',
      email: 'hanishvavilapalli17@gmail.com',
      password: 'Hanish@2004',
      role: 'admin',
      created_at: '2026-08-14T10:25:34.131Z',
    },
    {
      id: 'user-1786703134132',
      email: 'hanishvavilapalli@gmail.com',
      password: 'Hanish@2004',
      role: 'admin',
      created_at: '2026-08-15T05:08:00.000Z',
    },
    {
      id: 'user-1786733230183',
      email: 'hotharini69@gmail.com',
      password: 'Hotharini@69',
      role: 'admin',
      created_at: '2026-08-14T18:47:10.183Z',
    },
  ],
};

let initialized = false;

export function isStoreInitialized(): boolean {
  return initialized;
}


function saveLocalStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err: any) {
    console.warn('[LOCAL STORE SAVE WARNING]', err?.message || err);
  }
}

function loadLocalStore() {
  try {
    if (fs.existsSync(STORE_FILE)) {
      const content = fs.readFileSync(STORE_FILE, 'utf-8');
      const data = JSON.parse(content);

      if (data.profile) store.profile = { ...store.profile, ...data.profile };
      if (Array.isArray(data.categories) && data.categories.length > 0) {
        store.categories = data.categories;
      }
      if (Array.isArray(data.services) && data.services.length > 0) {
        store.services = data.services;
      }
      if (Array.isArray(data.reviews)) store.reviews = data.reviews;
      if (Array.isArray(data.paymentMethods) && data.paymentMethods.length > 0) {
        store.paymentMethods = data.paymentMethods;
      }
      if (Array.isArray(data.socialContacts) && data.socialContacts.length > 0) {
        store.socialContacts = data.socialContacts;
      }
      if (data.terms) store.terms = data.terms;
      if (data.messageTemplate) store.messageTemplate = data.messageTemplate;
      if (Array.isArray(data.users)) store.users = data.users;

      console.log(`[LOCAL STORE] Loaded ${store.services.length} services from disk persistence.`);
    }
  } catch (err: any) {
    console.warn('[LOCAL STORE LOAD WARNING]', err?.message || err);
  }
}

export function findUserByEmail(email: string) {
  if (!email) return null;
  const clean = email.trim().toLowerCase();
  return store.users.find((u: any) => u.email?.toLowerCase() === clean);
}

export function hasExistingAdminUser(): boolean {
  return Array.isArray(store.users) && store.users.some((u: any) => u.role === 'admin');
}

export function createAdminUser(email: string, passwordHash: string) {
  const clean = email.trim().toLowerCase();
  const existing = findUserByEmail(clean);
  if (existing) {
    existing.password = passwordHash;
    saveLocalStore();
    return existing;
  }
  const newUser = {
    id: 'user-' + Date.now(),
    email: clean,
    password: passwordHash,
    role: 'admin',
    created_at: new Date().toISOString(),
  };
  store.users.push(newUser);
  saveLocalStore();
  return newUser;
}

function safeSupabaseSync(task: () => Promise<any>) {
  task().catch((err) => {
    console.warn('[SUPABASE SYNC WARNING]', err?.message || err);
  });
}

const KNOWN_CATEGORY_ALIASES: Record<string, string> = {
  'demo': 'cat-demo',
  'cat-demo': 'cat-demo',
  '88bef4b9-fd4b-4ad2-97fa-4f9d154721c2': 'cat-demo',

  'video call (vc)': 'cat-vc',
  'video call': 'cat-vc',
  'cat-vc': 'cat-vc',
  'cd53d390-1cd5-4fc1-8e11-f30d9748d46d': 'cat-vc',

  'voice call': 'cat-voice',
  'cat-voice': 'cat-voice',
  'f0009287-5953-436d-8a5e-db73a37e37a6': 'cat-voice',

  'special services (without face)': 'cat-special',
  'premium services': 'cat-special',
  'special services': 'cat-special',
  'cat-special': 'cat-special',
  '26be4de5-dfff-4e1f-9116-2011c7d03fe4': 'cat-special',
};

function getCanonicalCategoryId(cat: any): string | null {
  if (!cat) return null;
  if (cat.id && KNOWN_CATEGORY_ALIASES[cat.id]) return KNOWN_CATEGORY_ALIASES[cat.id];
  if (cat.name) {
    const nameLower = String(cat.name).toLowerCase().trim();
    if (KNOWN_CATEGORY_ALIASES[nameLower]) return KNOWN_CATEGORY_ALIASES[nameLower];
  }
  return null;
}

const LEGACY_SERVICE_IDS = new Set([
  'b81d055c-24ad-4025-b3e3-f9a21fc618fb',
  '2e70f291-f070-4cf6-b416-76535aab0f36',
  '7435b2b3-7878-4c95-adf9-a6d9ffadc39d',
  'a90bc231-7474-4b21-b2d3-0bcb0c6d148c',
  '25312928-b062-4782-bc33-9c642a2d6e3a',
  'bb89e4b5-4da8-421d-a207-7397e94e9799',
  '9c943ef1-da5e-4bc6-81da-4e1c5a63fe95',
  '3ba257c2-50b7-4d56-877d-5f9092730bdb',
  'srv-1786702881000-wn1ts',
]);

const LEGACY_CATEGORY_IDS = new Set([
  '88bef4b9-fd4b-4ad2-97fa-4f9d154721c2',
  'cd53d390-1cd5-4fc1-8e11-f30d9748d46d',
  'f0009287-5953-436d-8a5e-db73a37e37a6',
  '26be4de5-dfff-4e1f-9116-2011c7d03fe4',
]);

function mergeServices(baseServices: any[], fetchedServices: any[]) {
  const map = new Map<string, any>();
  const all = [...fetchedServices, ...baseServices];

  for (const s of all) {
    if (!s || !s.id || LEGACY_SERVICE_IDS.has(s.id)) continue;
    let catId = s.category_id;
    if (catId && KNOWN_CATEGORY_ALIASES[catId]) {
      catId = KNOWN_CATEGORY_ALIASES[catId];
    }

    const existing = map.get(s.id);

    // Smart photos merge: prefer custom uploaded photos over pexels dummy photos
    let photos = Array.isArray(s.photos) ? s.photos : (existing?.photos || []);
    if (existing && Array.isArray(existing.photos) && existing.photos.length > 0) {
      const existingHasCustom = existing.photos.some((p: string) => typeof p === 'string' && p.length > 0 && !p.includes('pexels.com'));
      const sHasCustom = Array.isArray(s.photos) && s.photos.some((p: string) => typeof p === 'string' && p.length > 0 && !p.includes('pexels.com'));

      if (existingHasCustom && !sHasCustom) {
        photos = existing.photos;
      }
    }

    map.set(s.id, {
      ...existing,
      ...s,
      category_id: catId,
      photos: Array.isArray(photos) ? photos : [],
      enabled: s.enabled !== false && s.enabled !== 'false',
    });
  }
  return Array.from(map.values());
}

function mergeCategories(baseCats: any[], fetchedCats: any[]) {
  const map = new Map<string, any>();
  const all = [...fetchedCats, ...baseCats];

  for (const c of all) {
    if (!c || !c.id || LEGACY_CATEGORY_IDS.has(c.id)) continue;
    const canonicalId = getCanonicalCategoryId(c);
    const key = canonicalId || c.id;

    const existing = map.get(key);
    if (!existing) {
      const initialMatch = INITIAL_CATEGORIES.find((ic) => ic.id === key);
      map.set(key, initialMatch ? { ...initialMatch, ...c, id: key } : { ...c, id: key });
    } else {
      map.set(key, { ...existing, ...c, id: key });
    }
  }

  for (const ic of INITIAL_CATEGORIES) {
    if (!map.has(ic.id)) {
      map.set(ic.id, ic);
    }
  }

  const validCategoryIds = new Set(INITIAL_CATEGORIES.map((ic) => ic.id));
  return Array.from(map.values())
    .filter((c) => validCategoryIds.has(c.id))
    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
}

function mergeSocialContacts(baseContacts: any[], fetchedContacts: any[]) {
  const map = new Map<string, any>();

  // 1. Initial defaults
  for (const ic of INITIAL_SOCIAL_CONTACTS) {
    map.set(ic.platform, ic);
  }

  // 2. Fetched database contacts
  for (const c of fetchedContacts) {
    if (c && c.platform) {
      map.set(c.platform, { ...map.get(c.platform), ...c });
    }
  }

  // 3. Local store user edits (highest priority)
  for (const c of baseContacts) {
    if (c && c.platform) {
      map.set(c.platform, { ...map.get(c.platform), ...c });
    }
  }

  return Array.from(map.values());
}

let dbReady = false;

export function isDbReady(): boolean {
  return dbReady;
}

export async function initDatabaseStore() {
  if (initialized) return;

  // Step 1: Load from local disk storage if available
  loadLocalStore();

  // Step 2: Ensure default structures
  store.categories = mergeCategories(INITIAL_CATEGORIES, store.categories);
  store.services = mergeServices(INITIAL_SERVICES, store.services);
  store.socialContacts = mergeSocialContacts(INITIAL_SOCIAL_CONTACTS, store.socialContacts);

  let attempts = 0;
  const maxAttempts = process.env.NODE_ENV === 'production' ? 3 : 1;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const fetchTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Supabase fetch timed out after 5000ms (attempt ${attempts})`)), 5000)
      );

      const supabaseFetch = Promise.all([
        adminSupabase.from('profile').select('*').limit(1).maybeSingle(),
        adminSupabase.from('categories').select('*').order('position', { ascending: true }),
        adminSupabase.from('services').select('*').order('position', { ascending: true }),
        adminSupabase.from('reviews').select('*').order('created_at', { ascending: false }),
        adminSupabase.from('payment_methods').select('*').order('position', { ascending: true }),
        adminSupabase.from('social_contacts').select('*'),
        adminSupabase.from('terms').select('*').limit(1).maybeSingle(),
        adminSupabase.from('message_template').select('*').limit(1).maybeSingle(),
      ]);

      const [prof, cat, serv, rev, pay, cont, term, msg]: any = await Promise.race([
        supabaseFetch,
        fetchTimeout,
      ]);

      if (prof.data) store.profile = { ...store.profile, ...prof.data };
      if (cat.data && cat.data.length > 0) store.categories = mergeCategories(store.categories, cat.data);
      if (serv.data && serv.data.length > 0) store.services = mergeServices(store.services, serv.data);
      if (rev.data && rev.data.length > 0) store.reviews = rev.data;
      if (pay.data && pay.data.length > 0) store.paymentMethods = pay.data;
      if (cont.data && cont.data.length > 0) store.socialContacts = mergeSocialContacts(store.socialContacts, cont.data);
      if (term.data && term.data.content && term.data.content.trim().length > 0) store.terms = term.data;
      if (msg.data && msg.data.template && msg.data.template.trim().length > 0) store.messageTemplate = msg.data;

      initialized = true;
      dbReady = true;
      saveLocalStore();
      console.log(`[STORE] Server database store initialized successfully. Active services: ${store.services.length}`);
      return;
    } catch (e: any) {
      console.warn(`[STORE] Database initialization attempt ${attempts} warning:`, e.message);
      if (attempts < maxAttempts) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }
  }

  initialized = true;
  dbReady = true;
  saveLocalStore();
  console.log('[STORE] Store initialized with disk persistence fallback.');
}

// ----------------- SERVICES -----------------
export function getServices(enabledOnly = false) {
  if (enabledOnly) {
    return store.services.filter((s) => s.enabled !== false && s.enabled !== 'false');
  }
  return store.services;
}

export function getServiceById(id: string) {
  return store.services.find((s) => s.id === id) || null;
}

export async function createService(data: any) {
  const catId = (data.category_id && KNOWN_CATEGORY_ALIASES[data.category_id]) || data.category_id || 'cat-demo';
  const newService = {
    id: data.id || `srv-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name: data.name,
    price: Number(data.price || 0),
    duration: data.duration || '5 Minutes',
    category_id: catId,
    short_description: data.short_description || null,
    full_description: data.full_description || null,
    important_info: data.important_info || null,
    photos: Array.isArray(data.photos) ? data.photos : [],
    enabled: data.enabled !== undefined && data.enabled !== 'false' ? Boolean(data.enabled) : true,
    position: data.position ?? store.services.length,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const { error } = await adminSupabase.from('services').insert(newService);
    if (error) console.warn('[SUPABASE SERVICE INSERT WARNING]', error.message);
    await syncServiceToGoogleSheet(newService).catch(() => {});
  } catch (e: any) {
    console.warn('[SUPABASE SERVICE INSERT EXCEPTION]', e?.message || e);
  }

  store.services.push(newService);
  saveLocalStore();
  broadcastChange('service_created', newService);
  return newService;
}

export async function updateService(id: string, updates: any) {
  const index = store.services.findIndex((s) => s.id === id);
  if (index === -1) return null;

  if (updates.category_id && KNOWN_CATEGORY_ALIASES[updates.category_id]) {
    updates.category_id = KNOWN_CATEGORY_ALIASES[updates.category_id];
  }

  const payload = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const dbPayload = { ...payload };
  delete dbPayload.category; // remove populated join fields if any

  try {
    const { error } = await adminSupabase.from('services').update(dbPayload).eq('id', id);
    if (error) {
      console.warn('[SUPABASE SERVICE UPDATE WARNING]', error.message);
    }
  } catch (e: any) {
    console.warn('[SUPABASE SERVICE UPDATE EXCEPTION]', e?.message || e);
  }

  store.services[index] = {
    ...store.services[index],
    ...payload,
  };

  const updated = store.services[index];
  saveLocalStore();
  syncServiceToGoogleSheet(updated).catch(() => {});
  broadcastChange('service_updated', updated);
  return updated;
}

export async function toggleService(id: string) {
  const index = store.services.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const nextEnabled = !store.services[index].enabled;
  const updatedAt = new Date().toISOString();

  try {
    const { error } = await adminSupabase.from('services').update({ enabled: nextEnabled, updated_at: updatedAt }).eq('id', id);
    if (error) console.warn('[SUPABASE SERVICE TOGGLE WARNING]', error.message);
  } catch (e: any) {
    console.warn('[SUPABASE SERVICE TOGGLE EXCEPTION]', e?.message || e);
  }

  store.services[index].enabled = nextEnabled;
  store.services[index].updated_at = updatedAt;
  const updated = store.services[index];

  saveLocalStore();
  syncServiceToGoogleSheet(updated).catch(() => {});
  broadcastChange('service_toggled', updated);
  return updated;
}

export async function deleteService(id: string) {
  const index = store.services.findIndex((s) => s.id === id);
  if (index === -1) return false;

  try {
    const { error } = await adminSupabase.from('services').delete().eq('id', id);
    if (error) console.warn('[SUPABASE SERVICE DELETE WARNING]', error.message);
    deleteServiceFromGoogleSheet(id).catch(() => {});
  } catch (e: any) {
    console.warn('[SUPABASE SERVICE DELETE EXCEPTION]', e?.message || e);
  }

  store.services.splice(index, 1);
  saveLocalStore();
  broadcastChange('service_deleted', { id });
  return true;
}

// ----------------- PROFILE & AVAILABILITY -----------------
export function getProfile() {
  return store.profile;
}

export async function updateProfile(updates: any) {
  const payload = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await adminSupabase.from('profile').update(payload).eq('id', store.profile.id).select();
    if (error) {
      console.warn('[SUPABASE PROFILE UPDATE WARNING]', error.message);
    }
    if (!data || data.length === 0) {
      const { error: upsertErr } = await adminSupabase.from('profile').upsert({ ...store.profile, ...payload });
      if (upsertErr) {
        console.warn('[SUPABASE PROFILE UPSERT WARNING]', upsertErr.message);
      }
    }
  } catch (e: any) {
    console.warn('[SUPABASE PROFILE UPDATE EXCEPTION]', e?.message || e);
  }

  store.profile = {
    ...store.profile,
    ...payload,
  };

  saveLocalStore();
  broadcastChange('profile_updated', store.profile);
  return store.profile;
}

export async function updateAvailability(status: string) {
  const updatedAt = new Date().toISOString();

  try {
    const { data, error } = await adminSupabase.from('profile').update({ availability: status, updated_at: updatedAt }).eq('id', store.profile.id).select();
    if (error || !data || data.length === 0) {
      const { error: upsertErr } = await adminSupabase.from('profile').upsert({ ...store.profile, availability: status, updated_at: updatedAt });
      if (upsertErr) console.warn('[SUPABASE AVAILABILITY UPSERT WARNING]', upsertErr.message);
    }
  } catch (e: any) {
    console.warn('[SUPABASE AVAILABILITY UPDATE EXCEPTION]', e?.message || e);
  }

  store.profile.availability = status;
  store.profile.updated_at = updatedAt;

  saveLocalStore();
  broadcastChange('availability_updated', { availability: status });
  return { availability: status };
}


// ----------------- PUBLIC DATA -----------------
export function getPublicData() {
  const cleanProfile = { ...store.profile };
  delete cleanProfile.admin_id;

  return {
    profile: cleanProfile,
    categories: store.categories,
    services: store.services.filter((s) => s.enabled !== false && s.enabled !== 'false'),
    reviews: store.reviews.filter((r) => r.hidden !== true && r.hidden !== 'true'),
    paymentMethods: store.paymentMethods.filter((p) => p.enabled !== false && p.enabled !== 'false'),
    socialContacts: store.socialContacts.filter((c) => c.enabled !== false && c.enabled !== 'false'),
    terms: store.terms,
    messageTemplate: store.messageTemplate,
  };
}

// ----------------- REVIEWS -----------------
export function getReviews() {
  return store.reviews;
}

export async function createReview(data: any) {
  const newReview = {
    id: `rev-${Date.now()}`,
    reviewer_name: data.reviewer_name?.trim() || 'Anonymous Client',
    rating: Number(data.rating || 5),
    review_text: data.review_text?.trim() || null,
    verified: true,
    hidden: false,
    flagged: false,
    created_at: new Date().toISOString(),
  };

  try {
    const { error } = await adminSupabase.from('reviews').insert(newReview);
    if (error) console.warn('[SUPABASE REVIEW INSERT WARNING]', error.message);
  } catch (e: any) {
    console.warn('[SUPABASE REVIEW INSERT EXCEPTION]', e?.message || e);
  }

  store.reviews.unshift(newReview);
  saveLocalStore();
  broadcastChange('review_created', newReview);
  return newReview;
}

export async function toggleHideReview(id: string) {
  const index = store.reviews.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const nextHidden = !store.reviews[index].hidden;

  try {
    const { error } = await adminSupabase.from('reviews').update({ hidden: nextHidden }).eq('id', id);
    if (error) console.warn('[SUPABASE REVIEW HIDE WARNING]', error.message);
  } catch (e: any) {
    console.warn('[SUPABASE REVIEW HIDE EXCEPTION]', e?.message || e);
  }

  store.reviews[index].hidden = nextHidden;
  const updated = store.reviews[index];
  saveLocalStore();
  broadcastChange('review_hidden', updated);
  return updated;
}

export async function toggleFlagReview(id: string) {
  const index = store.reviews.findIndex((r) => r.id === id);
  if (index === -1) return null;

  const nextFlagged = !store.reviews[index].flagged;

  try {
    const { error } = await adminSupabase.from('reviews').update({ flagged: nextFlagged }).eq('id', id);
    if (error) console.warn('[SUPABASE REVIEW FLAG WARNING]', error.message);
  } catch (e: any) {
    console.warn('[SUPABASE REVIEW FLAG EXCEPTION]', e?.message || e);
  }

  store.reviews[index].flagged = nextFlagged;
  const updated = store.reviews[index];
  saveLocalStore();
  broadcastChange('review_flagged', updated);
  return updated;
}

// ----------------- PAYMENT METHODS -----------------
export function getPaymentMethods() {
  return store.paymentMethods;
}

export async function createPaymentMethod(data: any) {
  const newPayment = {
    id: `pay-${Date.now()}`,
    name: data.name.trim(),
    enabled: data.enabled !== undefined ? data.enabled : true,
    position: data.position ?? store.paymentMethods.length,
  };

  try {
    const { error } = await adminSupabase.from('payment_methods').insert(newPayment);
    if (error) console.warn('[SUPABASE PAYMENT INSERT WARNING]', error.message);
  } catch (e: any) {
    console.warn('[SUPABASE PAYMENT INSERT EXCEPTION]', e?.message || e);
  }

  store.paymentMethods.push(newPayment);
  saveLocalStore();
  broadcastChange('payment_created', newPayment);
  return newPayment;
}

export async function updatePaymentMethod(id: string, updates: any) {
  const index = store.paymentMethods.findIndex((p) => p.id === id);
  if (index === -1) return null;

  try {
    const { error } = await adminSupabase.from('payment_methods').update(updates).eq('id', id);
    if (error) console.warn('[SUPABASE PAYMENT UPDATE WARNING]', error.message);
  } catch (e: any) {
    console.warn('[SUPABASE PAYMENT UPDATE EXCEPTION]', e?.message || e);
  }

  store.paymentMethods[index] = { ...store.paymentMethods[index], ...updates };
  const updated = store.paymentMethods[index];
  saveLocalStore();
  broadcastChange('payment_updated', updated);
  return updated;
}

export async function togglePaymentMethod(id: string) {
  const index = store.paymentMethods.findIndex((p) => p.id === id);
  if (index === -1) return null;

  const nextEnabled = !store.paymentMethods[index].enabled;

  try {
    const { error } = await adminSupabase.from('payment_methods').update({ enabled: nextEnabled }).eq('id', id);
    if (error) console.warn('[SUPABASE PAYMENT TOGGLE WARNING]', error.message);
  } catch (e: any) {
    console.warn('[SUPABASE PAYMENT TOGGLE EXCEPTION]', e?.message || e);
  }

  store.paymentMethods[index].enabled = nextEnabled;
  const updated = store.paymentMethods[index];
  saveLocalStore();
  broadcastChange('payment_toggled', updated);
  return updated;
}

export async function deletePaymentMethod(id: string) {
  const index = store.paymentMethods.findIndex((p) => p.id === id);
  if (index === -1) return false;

  try {
    const { error } = await adminSupabase.from('payment_methods').delete().eq('id', id);
    if (error) console.warn('[SUPABASE PAYMENT DELETE WARNING]', error.message);
  } catch (e: any) {
    console.warn('[SUPABASE PAYMENT DELETE EXCEPTION]', e?.message || e);
  }

  store.paymentMethods.splice(index, 1);
  saveLocalStore();
  broadcastChange('payment_deleted', { id });
  return true;
}

// ----------------- TERMS -----------------
export function getTerms() {
  return store.terms;
}

export async function updateTerms(content: string) {
  const updatedAt = new Date().toISOString();
  const tId = store.terms?.id || 'terms-default';

  try {
    const { data: updateData, error } = await adminSupabase.from('terms').update({ content, updated_at: updatedAt }).eq('id', tId).select();
    if (error || !updateData || updateData.length === 0) {
      const { error: upsertErr } = await adminSupabase.from('terms').upsert({ id: tId, content, updated_at: updatedAt });
      if (upsertErr) console.warn('[SUPABASE TERMS UPSERT WARNING]', upsertErr.message);
    }
  } catch (e: any) {
    console.warn('[SUPABASE TERMS UPDATE EXCEPTION]', e?.message || e);
  }

  store.terms = {
    id: tId,
    content,
    updated_at: updatedAt,
  };

  saveLocalStore();
  broadcastChange('terms_updated', store.terms);
  broadcastChange('terms_published', store.terms);
  return store.terms;
}

// ----------------- SOCIAL CONTACTS -----------------
export function getSocialContacts() {
  return store.socialContacts;
}

export async function updateSocialContacts(contacts: any[]) {
  if (Array.isArray(contacts)) {
    const updatedAt = new Date().toISOString();
    const formatted = contacts.map((c) => ({
      id: c.id || `sc-${c.platform || Date.now()}`,
      platform: String(c.platform || '').trim(),
      value: String(c.value || '').trim(),
      enabled: c.enabled !== false && c.enabled !== 'false',
      updated_at: updatedAt,
    }));

    // Update in-memory store immediately with user changes
    const map = new Map<string, any>();
    for (const sc of store.socialContacts) {
      if (sc && sc.platform) map.set(sc.platform, sc);
    }
    for (const sc of formatted) {
      if (sc && sc.platform) map.set(sc.platform, { ...map.get(sc.platform), ...sc });
    }
    store.socialContacts = Array.from(map.values());

    // Save to disk store.json right away
    saveLocalStore();
    broadcastChange('social_contacts_updated', store.socialContacts);

    // Persist to Supabase DB for supported database platforms
    const DB_SUPPORTED_PLATFORMS = ['whatsapp', 'instagram', 'telegram'];
    try {
      for (const c of formatted) {
        if (!c.platform || !DB_SUPPORTED_PLATFORMS.includes(c.platform.toLowerCase())) continue;

        const { error: updateErr } = await adminSupabase
          .from('social_contacts')
          .update({ value: c.value, enabled: c.enabled, updated_at: c.updated_at })
          .eq('platform', c.platform);

        if (updateErr) {
          console.warn(`[SUPABASE CONTACTS UPDATE WARNING] ${c.platform}:`, updateErr.message);
        }
      }
    } catch (e: any) {
      console.warn('[SUPABASE CONTACTS UPDATE WARNING]', e?.message || e);
    }
  }
  return store.socialContacts;
}

// ----------------- MESSAGE TEMPLATE -----------------
export function getMessageTemplate() {
  return store.messageTemplate;
}

export async function updateMessageTemplate(template: string) {
  const updatedAt = new Date().toISOString();
  const tId = store.messageTemplate?.id || 'msg-tpl-001';

  try {
    const { data: updateData, error: updateErr } = await adminSupabase
      .from('message_template')
      .update({ template, updated_at: updatedAt })
      .eq('id', tId)
      .select('*');

    if (updateErr) {
      console.warn('[SUPABASE TEMPLATE UPDATE WARNING]', updateErr.message);
    }

    if (!updateData || updateData.length === 0) {
      const { error: upsertErr } = await adminSupabase
        .from('message_template')
        .upsert({ id: tId, template, updated_at: updatedAt });
      if (upsertErr) {
        console.warn('[SUPABASE TEMPLATE UPSERT WARNING]', upsertErr.message);
      }
    }
  } catch (e: any) {
    console.warn('[SUPABASE TEMPLATE UPDATE EXCEPTION]', e?.message || e);
  }

  store.messageTemplate = {
    ...store.messageTemplate,
    template,
    updated_at: updatedAt,
  };
  saveLocalStore();
  broadcastChange('message_template_updated', store.messageTemplate);
  return store.messageTemplate;
}

