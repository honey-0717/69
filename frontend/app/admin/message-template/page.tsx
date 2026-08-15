'use client';

import { useEffect, useState } from 'react';
import type { MessageTemplate } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Info } from 'lucide-react';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/api-client';

const defaultTemplate = `Hi, I'm interested in [Service Name].

Duration: [Duration]
Price: [Price]

I would like to book this service.`;

import { logAdminActivity } from '@/lib/activity';

export default function AdminMessageTemplatePage() {
  const [template, setTemplate] = useState<MessageTemplate | null>(null);
  const [content, setContent] = useState(defaultTemplate);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    apiRequest<MessageTemplate>('/api/message-template').then(({ data }) => {
      setTemplate(data);
      if (data?.template) setContent(data.template);
      setLoading(false);
    });
  }, []);

  async function save() {
    setSaving(true);
    const { data, error } = await apiRequest<MessageTemplate>('/api/message-template', {
      method: 'PUT',
      body: JSON.stringify({ template: content }),
    });

    if (error) {
      toast.error('Failed to save template: ' + error);
    } else {
      setTemplate(data);
      toast.success('Message template saved');
      logAdminActivity('message_template_updated', 'Updated contact message template');
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

  const preview = content
    .replace(/\[Service Name\]/g, 'Video Call - 5 Min')
    .replace(/\[Duration\]/g, '5 Minutes')
    .replace(/\[Price\]/g, '₹500');

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Message Template</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Customize the pre-filled message customers send</p>
      </div>

      <div className="glass-card p-4 border-primary/20">
        <div className="flex items-start gap-2.5">
          <Info size={16} className="text-primary shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-white mb-1">Dynamic Fields</p>
            <p>Use these placeholders — they are automatically replaced when a customer contacts you:</p>
            <ul className="mt-2 space-y-0.5 text-xs">
              <li><code className="text-primary">[Service Name]</code> — replaced with the service name</li>
              <li><code className="text-primary">[Duration]</code> — replaced with the service duration</li>
              <li><code className="text-primary">[Price]</code> — replaced with the service price</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wider text-muted-foreground">Template</label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          className="bg-white/5 border-white/10 rounded-xl resize-none text-sm leading-relaxed font-mono"
        />
      </div>

      {/* Preview */}
      <div>
        <label className="text-xs uppercase tracking-wider text-muted-foreground mb-2 block">Preview (with sample data)</label>
        <div className="glass-card p-4">
          <pre className="text-sm text-white/80 whitespace-pre-wrap font-sans">{preview}</pre>
        </div>
      </div>

      <Button
        onClick={save}
        disabled={saving}
        className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 rounded-xl gap-2"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Save Template
      </Button>
    </div>
  );
}
