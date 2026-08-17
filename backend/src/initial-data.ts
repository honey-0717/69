export const INITIAL_SOCIAL_CONTACTS = [
  {
    id: 'sc-whatsapp',
    platform: 'whatsapp',
    value: '+919999999999',
    enabled: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sc-instagram',
    platform: 'instagram',
    value: 'hotharini69',
    enabled: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sc-telegram',
    platform: 'telegram',
    value: 'hotharini69',
    enabled: true,
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sc-snapchat',
    platform: 'snapchat',
    value: 'hotharini69',
    enabled: true,
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_CATEGORIES = [
  {
    id: 'cat-demo',
    name: 'DEMO',
    position: 0,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-vc',
    name: 'VIDEO CALL (VC)',
    position: 1,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-voice',
    name: 'VOICE CALL',
    position: 2,
    created_at: new Date().toISOString(),
  },
  {
    id: 'cat-special',
    name: 'SPECIAL SERVICES (without face)',
    position: 3,
    created_at: new Date().toISOString(),
  },
];

export const INITIAL_SERVICES = [
  // DEMO
  {
    id: 'srv-demo-1',
    category_id: 'cat-demo',
    name: '1MIN - 100 (with Dress)',
    price: 100,
    duration: '1 Minute',
    short_description: 'Quick 1-minute demo session with dress.',
    full_description: 'A 1-minute preview demo session with dress.',
    important_info: 'Restrictions:\n1. NO MEETS\n2. NO FACE\n3. NO BARGAINING',
    photos: ['https://images.pexels.com/photos/35165348/pexels-photo-35165348.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
    enabled: true,
    position: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'srv-demo-2',
    category_id: 'cat-demo',
    name: '1MIN - ₹150 (NUDE)',
    price: 150,
    duration: '1 Minute',
    short_description: '1-minute demo session (NUDE).',
    full_description: 'A 1-minute preview demo session (NUDE).',
    important_info: 'Restrictions:\n1. NO MEETS\n2. NO FACE\n3. NO BARGAINING',
    photos: ['https://images.pexels.com/photos/21966540/pexels-photo-21966540.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
    enabled: true,
    position: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // VIDEO CALL (VC)
  {
    id: 'srv-vc-1',
    category_id: 'cat-vc',
    name: '5MIN - 500',
    price: 500,
    duration: '5 Minutes',
    short_description: '5-minute private Video Call session.',
    full_description: 'Private 5-minute video call session.',
    important_info: 'Restrictions:\n1. NO MEETS\n2. NO FACE\n3. NO BARGAINING',
    photos: ['https://images.pexels.com/photos/38290945/pexels-photo-38290945.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
    enabled: true,
    position: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'srv-vc-2',
    category_id: 'cat-vc',
    name: '10 MIN - 1000',
    price: 1000,
    duration: '10 Minutes',
    short_description: '10-minute private Video Call session.',
    full_description: 'Extended 10-minute private video call session.',
    important_info: 'Restrictions:\n1. NO MEETS\n2. NO FACE\n3. NO BARGAINING',
    photos: ['https://images.pexels.com/photos/28896930/pexels-photo-28896930.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
    enabled: true,
    position: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // VOICE CALL
  {
    id: 'srv-voice-1',
    category_id: 'cat-voice',
    name: '5MIN - 400',
    price: 400,
    duration: '5 Minutes',
    short_description: '5-minute private Voice Call session.',
    full_description: 'Private 5-minute voice call session.',
    important_info: 'Restrictions:\n1. NO MEETS\n2. NO FACE\n3. NO BARGAINING',
    photos: ['https://images.pexels.com/photos/35435482/pexels-photo-35435482.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
    enabled: true,
    position: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'srv-voice-2',
    category_id: 'cat-voice',
    name: '10 MIN - ₹750',
    price: 750,
    duration: '10 Minutes',
    short_description: '10-minute private Voice Call session.',
    full_description: 'Extended 10-minute private voice call session.',
    important_info: 'Restrictions:\n1. NO MEETS\n2. NO FACE\n3. NO BARGAINING',
    photos: ['https://images.pexels.com/photos/31824860/pexels-photo-31824860.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
    enabled: true,
    position: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // SPECIAL SERVICES (without face)
  {
    id: 'srv-special-1',
    category_id: 'cat-special',
    name: 'CUM SHOW - ₹1000 (5MIN)',
    price: 1000,
    duration: '5 Minutes',
    short_description: '5-minute Cum Show (without face).',
    full_description: 'Exclusive 5-minute Cum Show session (without face).',
    important_info: 'Restrictions:\n1. NO MEETS\n2. NO FACE\n3. NO BARGAINING',
    photos: ['https://images.pexels.com/photos/38290945/pexels-photo-38290945.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
    enabled: true,
    position: 6,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'srv-special-2',
    category_id: 'cat-special',
    name: 'SAREE SHOW - ₹1000 (5MIN)',
    price: 1000,
    duration: '5 Minutes',
    short_description: '5-minute Saree Show (without face).',
    full_description: 'Exclusive 5-minute Saree Show session (without face).',
    important_info: 'Restrictions:\n1. NO MEETS\n2. NO FACE\n3. NO BARGAINING',
    photos: ['https://images.pexels.com/photos/35165348/pexels-photo-35165348.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
    enabled: true,
    position: 7,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'srv-special-3',
    category_id: 'cat-special',
    name: 'BRINJAL SHOW - ₹1000 (5MIN)',
    price: 1000,
    duration: '5 Minutes',
    short_description: '5-minute Brinjal Show (without face).',
    full_description: 'Exclusive 5-minute Brinjal Show session (without face).',
    important_info: 'Restrictions:\n1. NO MEETS\n2. NO FACE\n3. NO BARGAINING',
    photos: ['https://images.pexels.com/photos/28896930/pexels-photo-28896930.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
    enabled: true,
    position: 8,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'srv-special-4',
    category_id: 'cat-special',
    name: 'SAREE + CUM SHOW - ₹1500 (5MIN)',
    price: 1500,
    duration: '5 Minutes',
    short_description: '5-minute Saree + Cum Show combo (without face).',
    full_description: 'Exclusive 5-minute Saree + Cum Show combo session (without face).',
    important_info: 'Restrictions:\n1. NO MEETS\n2. NO FACE\n3. NO BARGAINING',
    photos: ['https://images.pexels.com/photos/21966540/pexels-photo-21966540.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
    enabled: true,
    position: 9,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'srv-special-5',
    category_id: 'cat-special',
    name: 'BRINJAL + CUM SHOW - ₹1500 (5MIN)',
    price: 1500,
    duration: '5 Minutes',
    short_description: '5-minute Brinjal + Cum Show combo (without face).',
    full_description: 'Exclusive 5-minute Brinjal + Cum Show combo session (without face).',
    important_info: 'Restrictions:\n1. NO MEETS\n2. NO FACE\n3. NO BARGAINING',
    photos: ['https://images.pexels.com/photos/35435482/pexels-photo-35435482.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'],
    position: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const INITIAL_REVIEWS: any[] = [];

export const DEFAULT_TERMS = `1. Time-pass persons, please stay away.

2. Please contact only if you are genuinely interested in the selected service.

3. Prices are fixed. No bargaining.

4. No meet-ups or offline services.

5. Please respect the service provider and communicate politely.

6. Do not waste time with repeated or unnecessary messages.

7. Service duration and price must be confirmed before proceeding.

8. Availability can change at any time.

9. Do not share or misuse personal information.

10. Please use only the listed contact methods.

11. Any violation of these terms may result in the contact being declined or blocked.

12. By continuing, you confirm that you have read and agreed to these terms.`;

