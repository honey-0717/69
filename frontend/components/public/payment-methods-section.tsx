'use client';

import { CreditCard } from 'lucide-react';
import type { PaymentMethod } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { PaymentLogo } from '@/components/ui/payment-logo';

export function PaymentMethodsSection({
  methods,
  className,
}: {
  methods: PaymentMethod[];
  className?: string;
}) {
  const enabledMethods = (methods || []).filter((m) => m.enabled !== false);

  if (enabledMethods.length === 0) return null;

  return (
    <div className={cn('glass-card p-5 sm:p-6', className)}>
      <div className="flex items-center gap-2 mb-4">
        <CreditCard size={18} className="text-primary" />
        <h3 className="font-semibold text-white text-base">Accepted Payment Methods</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        The provider accepts the following payment methods. Payments are handled directly with the provider — not through this website.
      </p>
      <div className="flex flex-wrap gap-2.5">
        {enabledMethods.map((method) => (
          <div
            key={method.id}
            className="flex items-center gap-2.5 glass px-3.5 py-2 rounded-xl border border-white/10"
          >
            <PaymentLogo name={method.name} className="w-7 h-7" />
            <span className="text-sm text-white/90 font-medium">{method.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
