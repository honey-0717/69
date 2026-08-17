'use client';

import { useEffect, useState } from 'react';
import type { PaymentMethod } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/api-client';
import { PaymentLogo } from '@/components/ui/payment-logo';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { logAdminActivity } from '@/lib/activity';

const defaultMethods: PaymentMethod[] = [
  { id: 'pm-phonepe', name: 'PhonePe', enabled: true, position: 0, created_at: '' },
  { id: 'pm-gpay', name: 'Google Pay', enabled: true, position: 1, created_at: '' },
  { id: 'pm-paytm', name: 'Paytm', enabled: true, position: 2, created_at: '' },
  { id: 'pm-upi', name: 'UPI', enabled: true, position: 3, created_at: '' },
  { id: 'pm-paypal', name: 'PayPal', enabled: true, position: 4, created_at: '' },
];

export default function AdminPaymentsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<PaymentMethod | null>(null);
  const [name, setName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await apiRequest<PaymentMethod[]>('/api/payments');
    if (data && data.length > 0) {
      setMethods(data);
    } else {
      setMethods(defaultMethods);
    }
    setLoading(false);
  }

  function openAdd() {
    setEditTarget(null);
    setName('');
    setDialogOpen(true);
  }

  function openEdit(method: PaymentMethod) {
    setEditTarget(method);
    setName(method.name);
    setDialogOpen(true);
  }

  async function save() {
    if (!name.trim()) {
      toast.error('Please enter a payment method name');
      return;
    }
    if (editTarget && !editTarget.id.startsWith('pm-')) {
      const { error } = await apiRequest(`/api/payments/${editTarget.id}`, {
        method: 'PUT',
        body: JSON.stringify({ name: name.trim() }),
      });
      if (error) toast.error('Failed to update: ' + error);
      else {
        toast.success('Payment method updated');
        logAdminActivity('payment_method_updated', `Updated payment method "${name.trim()}"`, { id: editTarget.id });
      }
    } else {
      const { error } = await apiRequest('/api/payments', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), position: methods.length }),
      });
      if (error) toast.error('Failed to add: ' + error);
      else {
        toast.success('Payment method added');
        logAdminActivity('payment_method_updated', `Added new payment method "${name.trim()}"`);
      }
    }
    setDialogOpen(false);
    load();
  }

  async function toggleEnabled(method: PaymentMethod) {
    if (method.id.startsWith('pm-')) {
      // First save to DB if it was a default item
      const { data, error } = await apiRequest<PaymentMethod>('/api/payments', {
        method: 'POST',
        body: JSON.stringify({ name: method.name, enabled: !method.enabled, position: method.position }),
      });
      if (!error && data) {
        toast.success(`${method.name} ${data.enabled ? 'enabled' : 'disabled'}`);
        load();
      }
      return;
    }

    const { data, error } = await apiRequest<PaymentMethod>(`/api/payments/${method.id}/toggle`, {
      method: 'PATCH',
    });
    if (error) toast.error('Failed to update: ' + error);
    else {
      const nextState = data?.enabled ?? !method.enabled;
      toast.success(`${method.name} ${nextState ? 'enabled' : 'disabled'}`);
      logAdminActivity('payment_method_updated', `${nextState ? 'Enabled' : 'Disabled'} payment method "${method.name}"`, { id: method.id, enabled: nextState });
      load();
    }
  }

  async function remove() {
    if (!deleteTarget) return;
    if (deleteTarget.id.startsWith('pm-')) {
      setMethods(methods.filter(m => m.id !== deleteTarget.id));
      setDeleteTarget(null);
      return;
    }

    const { error } = await apiRequest(`/api/payments/${deleteTarget.id}`, {
      method: 'DELETE',
    });
    if (error) toast.error('Failed to delete: ' + error);
    else {
      toast.success(`${deleteTarget.name} removed`);
      logAdminActivity('payment_method_updated', `Removed payment method "${deleteTarget.name}"`, { id: deleteTarget.id });
      setDeleteTarget(null);
      load();
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Accepted Payment Methods</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage which payment methods customers see</p>
        </div>
        <Button onClick={openAdd} className="bg-gradient-to-r from-primary to-secondary text-white gap-2 rounded-xl">
          <Plus size={16} />
          Add Method
        </Button>
      </div>

      <div className="space-y-3">
        {methods.map((method) => (
          <div key={method.id} className="glass-card p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <PaymentLogo name={method.name} className="w-10 h-10 shrink-0" />
              <div>
                <h3 className="font-bold text-white text-base">{method.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {method.enabled ? 'Visible to customers' : 'Hidden from customers'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" className="h-8 px-2.5 rounded-lg text-muted-foreground hover:text-white gap-1 text-xs" onClick={() => openEdit(method)}>
                  <Pencil size={14} />
                  <span>Edit</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-2 rounded-lg text-muted-foreground hover:text-error text-xs" onClick={() => setDeleteTarget(method)}>
                  <Trash2 size={14} />
                </Button>
              </div>
              <div className="flex items-center gap-2 pl-2 border-l border-white/10 shrink-0">
                <span className="text-[10px] text-muted-foreground sm:hidden font-medium">
                  {method.enabled ? 'Active' : 'Off'}
                </span>
                <Switch checked={method.enabled} onCheckedChange={() => toggleEnabled(method)} />
              </div>
            </div>
          </div>
        ))}

        {methods.length === 0 && (
          <div className="glass-card p-12 text-center">
            <p className="text-muted-foreground text-sm">No payment methods yet.</p>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass-card border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">{editTarget ? 'Edit Payment Method' : 'Add Payment Method'}</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. PhonePe"
              className="bg-white/5 border-white/10 rounded-xl"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl border-white/10">Cancel</Button>
            <Button onClick={save} className="bg-gradient-to-r from-primary to-secondary text-white rounded-xl gap-2">
              <Check size={16} />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="glass-card border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Remove this payment method?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {deleteTarget?.name} will be removed from your accepted methods.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove} className="bg-error text-white hover:bg-error/90 rounded-xl">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
