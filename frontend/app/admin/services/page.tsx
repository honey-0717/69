'use client';

import { useEffect, useState } from 'react';
import type { Service, Category } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Eye, Trash2, Loader2, Clock } from 'lucide-react';
import { formatPrice } from '@/lib/helpers';
import { toast } from 'sonner';
import Link from 'next/link';
import { apiRequest } from '@/lib/api-client';
import { logAdminActivity } from '@/lib/activity';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const [servicesRes, categoriesRes] = await Promise.all([
      apiRequest<Service[]>('/api/services'),
      apiRequest<Category[]>('/api/categories'),
    ]);
    setServices(servicesRes.data ?? []);
    setCategories(categoriesRes.data ?? []);
    setLoading(false);
  }

  const getCategoryName = (id: string | null) =>
    categories.find((c) => c.id === id)?.name ?? 'Uncategorized';

  async function toggleEnabled(service: Service) {
    // Optimistic UI update
    setServices((prev) =>
      prev.map((s) => (s.id === service.id ? { ...s, enabled: !s.enabled } : s))
    );

    const { error, data } = await apiRequest<Service>(`/api/services/${service.id}/toggle`, {
      method: 'PATCH',
    });
    if (error) {
      toast.error('Failed to update service');
      // Rollback on error
      setServices((prev) =>
        prev.map((s) => (s.id === service.id ? { ...s, enabled: service.enabled } : s))
      );
    } else {
      toast.success(`${service.name} ${data?.enabled ? 'enabled' : 'disabled'}`);
      logAdminActivity('service_toggled', `${data?.enabled ? 'Enabled' : 'Disabled'} service ${service.name}`);
    }
  }

  async function deleteService(service: Service) {
    // Optimistic UI delete
    setServices((prev) => prev.filter((s) => s.id !== service.id));
    setDeleteTarget(null);

    const { error } = await apiRequest(`/api/services/${service.id}`, {
      method: 'DELETE',
    });
    if (error) {
      toast.error('Failed to delete service');
      // Rollback on error
      load();
    } else {
      toast.success(`${service.name} deleted`);
      logAdminActivity('service_deleted', `Deleted service ${service.name}`);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-white">Services</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{services.length} total services</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            Google Sheets Synced
          </span>
          <Link href="/admin/services/new" className="shrink-0">
            <Button className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 gap-1.5 rounded-xl text-xs sm:text-sm px-3.5 py-2">
              <Plus size={16} />
              Add Service
            </Button>
          </Link>
        </div>
      </div>

      <div className="space-y-3">
        {services.map((service) => (
          <div
            key={service.id}
            className="glass-card p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-0.5 rounded bg-white/5 border border-white/5">
                  {getCategoryName(service.category_id)}
                </span>
                {!service.enabled && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-muted/20 text-muted-foreground border border-white/5">Hidden</span>
                )}
              </div>
              <h3 className="font-bold text-white text-base sm:text-lg leading-snug">{service.name}</h3>
              <div className="flex items-center gap-3 mt-1 text-xs sm:text-sm text-muted-foreground">
                <span className="text-primary font-bold">{formatPrice(service.price)}</span>
                <span className="flex items-center gap-1">
                  <Clock size={13} className="shrink-0" />
                  {service.duration}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
              <div className="flex items-center gap-1">
                <Link href={`/service/${service.id}`} target="_blank">
                  <Button variant="ghost" size="sm" className="h-8 px-2.5 rounded-lg text-muted-foreground hover:text-white gap-1 text-xs">
                    <Eye size={14} />
                    <span>Preview</span>
                  </Button>
                </Link>
                <Link href={`/admin/services/${service.id}`}>
                  <Button variant="ghost" size="sm" className="h-8 px-2.5 rounded-lg text-muted-foreground hover:text-white gap-1 text-xs">
                    <Pencil size={14} />
                    <span>Edit</span>
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 rounded-lg text-muted-foreground hover:text-error gap-1 text-xs"
                  onClick={() => setDeleteTarget(service)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>

              <div className="flex items-center gap-2 pl-2 border-l border-white/10 shrink-0">
                <span className="text-[10px] text-muted-foreground sm:hidden font-medium">
                  {service.enabled ? 'Active' : 'Off'}
                </span>
                <Switch
                  checked={service.enabled}
                  onCheckedChange={() => toggleEnabled(service)}
                />
              </div>
            </div>
          </div>
        ))}

        {services.length === 0 && (
          <div className="glass-card p-12 text-center">
            <p className="text-muted-foreground mb-4">No services yet.</p>
            <Link href="/admin/services/new">
              <Button className="bg-gradient-to-r from-primary to-secondary text-white gap-2 rounded-xl">
                <Plus size={16} />
                Add your first service
              </Button>
            </Link>
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="glass-card border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete this service?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {deleteTarget?.name} will be permanently removed from your catalogue. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteService(deleteTarget)}
              className="bg-error text-white hover:bg-error/90 rounded-xl"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
