'use client';

import { useState } from 'react';
import { ChevronDown, Check, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TermsAccordion({
  terms,
  onAgree,
  agreed,
}: {
  terms: string;
  onAgree: () => void;
  agreed: boolean;
}) {
  const [open, setOpen] = useState(false);

  const termsList = terms
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-white">Terms &amp; Conditions</span>
          {agreed && (
            <span className="flex items-center gap-1 text-xs text-success">
              <Check size={14} />
              Agreed
            </span>
          )}
        </div>
        <ChevronDown
          size={20}
          className={cn(
            'text-muted-foreground transition-transform duration-300',
            open && 'rotate-180'
          )}
        />
      </button>

      {open && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 animate-fade-in">
          <div className="border-t border-white/10 pt-4 space-y-3">
            {termsList.map((term, i) => (
              <div key={i} className="flex gap-3 text-sm text-muted-foreground">
                <span className="text-primary font-semibold shrink-0">{i + 1}.</span>
                <span className="leading-relaxed">{term.replace(/^\d+\.\s*/, '')}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
