'use client';

import { use, useEffect, useState } from 'react';
import type { Service } from '@/lib/supabase';
import { INITIAL_SERVICES } from '@/lib/initial-data';
import { ServiceForm } from '@/components/admin/service-form';
import { Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/api-client';

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [service, setService] = useState<Service | null | undefined>(undefined);

  useEffect(() => {
    apiRequest<Service>(`/api/services/${id}`).then(({ data, error }) => {
      if (!error && data) {
        setService(data);
      } else {
        const found = INITIAL_SERVICES.find((s) => s.id === id);
        setService((found as Service) ?? null);
      }
    });
  }, [id]);

  if (service === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  if (service === null) {
    return (
      <div className="glass-card p-12 text-center">
        <p className="text-muted-foreground">Service not found.</p>
      </div>
    );
  }

  return <ServiceForm service={service} />;
}
