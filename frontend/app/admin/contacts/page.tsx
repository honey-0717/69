'use client';

import { useEffect, useState } from 'react';
import type { SocialContact } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MessageCircle, Instagram, Send, Ghost, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { apiRequest } from '@/lib/api-client';
import { logAdminActivity } from '@/lib/activity';

const platformConfig: Record<string, { label: string; icon: any; placeholder: string; prefix: string }> = {
  whatsapp: { label: 'WhatsApp', icon: MessageCircle, placeholder: '+91 9999999999', prefix: '' },
  instagram: { label: 'Instagram', icon: Instagram, placeholder: 'username', prefix: '@' },
  telegram: { label: 'Telegram', icon: Send, placeholder: 'username', prefix: '@' },
  snapchat: { label: 'Snapchat', icon: Ghost, placeholder: 'username', prefix: '@' },
};

const defaultPlatforms: SocialContact[] = [
  { id: 'default-wa', platform: 'whatsapp', value: '+919999999999', enabled: true, updated_at: '' },
  { id: 'default-ig', platform: 'instagram', value: 'hotharini69', enabled: true, updated_at: '' },
  { id: 'default-tg', platform: 'telegram', value: 'hotharini69', enabled: true, updated_at: '' },
  { id: 'default-sc', platform: 'snapchat', value: 'hotharini69', enabled: true, updated_at: '' },
];

type ContactState = Record<string, { id?: string; value: string; enabled: boolean }>;

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<SocialContact[]>([]);
  const [state, setState] = useState<ContactState>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiRequest<SocialContact[]>('/api/social-contacts').then(({ data }) => {
      const fetched = Array.isArray(data) ? data : [];
      const map = new Map<string, SocialContact>();
      defaultPlatforms.forEach((p) => map.set(p.platform, p));
      fetched.forEach((c) => {
        if (c && c.platform) {
          map.set(c.platform, { ...map.get(c.platform), ...c });
        }
      });
      const list = Array.from(map.values());
      setContacts(list);
      const newState: ContactState = {};
      list.forEach((c) => {
        newState[c.platform] = { id: String(c.id || '').startsWith('default-') ? undefined : c.id, value: c.value, enabled: c.enabled };
      });
      setState(newState);
      setLoading(false);
    });
  }, []);

  async function save() {
    setSaving(true);
    const payload = Object.entries(state).map(([platform, s]) => ({
      id: s.id || `sc-${platform}`,
      platform,
      value: s.value,
      enabled: s.enabled,
    }));

    const { error, data } = await apiRequest<SocialContact[]>('/api/social-contacts', {
      method: 'PUT',
      body: JSON.stringify({ contacts: payload }),
    });

    if (error) {
      toast.error('Failed to save contacts: ' + error);
    } else {
      toast.success('Contact settings saved');
      logAdminActivity('social_contact_updated', 'Updated social contact platforms & usernames');
      if (data && data.length > 0) {
        setContacts(data);
        const newState: ContactState = {};
        data.forEach((c) => {
          newState[c.platform] = { id: c.id, value: c.value, enabled: c.enabled };
        });
        setState(newState);
      }
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Social Contact Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your contact platforms and visibility</p>
      </div>

      <div className="space-y-4">
        {contacts.map((contact) => {
          const config = platformConfig[contact.platform] || { label: contact.platform, icon: Send, placeholder: '', prefix: '' };
          const Icon = config.icon;
          const s = state[contact.platform];

          return (
            <div key={contact.platform} className="glass-card p-5 animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                    <Icon size={18} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{config.label}</h3>
                    <p className="text-xs text-muted-foreground">
                      {s?.enabled ? 'Visible on website' : 'Hidden from website'}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={s?.enabled ?? false}
                  onCheckedChange={(checked) =>
                    setState({ ...state, [contact.platform]: { ...s, enabled: checked } })
                  }
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  {contact.platform === 'whatsapp' ? 'Phone Number' : 'Username'}
                </Label>
                <div className="relative">
                  {config.prefix && (
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                      {config.prefix}
                    </span>
                  )}
                  <Input
                    value={s?.value ?? ''}
                    onChange={(e) =>
                      setState({ ...state, [contact.platform]: { ...s, value: e.target.value } })
                    }
                    placeholder={config.placeholder}
                    className={cn('bg-white/5 border-white/10 rounded-xl', config.prefix && 'pl-8')}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        onClick={save}
        disabled={saving}
        className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 rounded-xl gap-2 w-full sm:w-auto py-2.5"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Save &amp; Update
      </Button>
    </div>
  );
}
