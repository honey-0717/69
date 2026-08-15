'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import type { Service, SocialContact } from '@/lib/supabase';
import { TermsAccordion } from './terms-accordion';
import { ContactButtons } from './contact-buttons';
import { fillTemplate } from '@/lib/helpers';

export function ServiceDetailClient({
  service,
  terms,
  messageTemplate,
  contacts,
}: {
  service: Service;
  terms: string;
  messageTemplate: string;
  contacts: SocialContact[];
}) {
  const [agreed, setAgreed] = useState(false);

  const message = fillTemplate(messageTemplate, {
    name: service.name,
    duration: service.duration,
    price: service.price,
  });

  return (
    <div className="space-y-4">
      <TermsAccordion
        terms={terms}
        agreed={agreed}
        onAgree={() => setAgreed(true)}
      />

      {!agreed ? (
        <button
          onClick={() => setAgreed(true)}
          className="w-full py-3.5 rounded-2xl font-semibold text-white bg-gradient-to-r from-primary to-secondary hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 glow-primary flex items-center justify-center gap-2 animate-fade-in"
        >
          <Check size={18} />
          I Agree &amp; Continue
        </button>
      ) : (
        <div className="glass-card p-5 border-success/20 animate-scale-in">
          <ContactButtons
            contacts={contacts}
            message={message}
            disabled={false}
          />
        </div>
      )}
    </div>
  );
}
