'use client';

import { useEffect, useState } from 'react';
import type { Terms } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Eye, FileText, Check } from 'lucide-react';
import { toast } from 'sonner';
import { apiRequest } from '@/lib/api-client';
import { logAdminActivity } from '@/lib/activity';

const defaultTerms = `1. Time-pass persons, please stay away.

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

export default function AdminTermsPage() {
  const [terms, setTerms] = useState<Terms | null>(null);
  const [content, setContent] = useState(defaultTerms);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    apiRequest<Terms>('/api/terms').then(({ data }) => {
      setTerms(data);
      if (data?.content) setContent(data.content);
      setLoading(false);
    });
  }, []);

  async function publish() {
    setSaving(true);
    const { data, error } = await apiRequest<Terms>('/api/terms/publish', {
      method: 'POST',
      body: JSON.stringify({ content }),
    });

    if (error) {
      toast.error('Failed to publish: ' + error);
    } else {
      setTerms(data);
      toast.success('Terms published');
      logAdminActivity('terms_published', 'Published updated Terms & Conditions document');
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

  const termsList = content
    .split('\n')
    .map((l) => l.trim().replace(/^\d+\.\s*/, ''))
    .filter((l) => l.length > 0);

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Terms & Conditions</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Edit and publish your service terms</p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowPreview(!showPreview)}
          className="rounded-xl border-white/10 gap-2"
        >
          {showPreview ? <FileText size={16} /> : <Eye size={16} />}
          {showPreview ? 'Edit' : 'Preview'}
        </Button>
      </div>

      {showPreview ? (
        <div className="glass-card p-5 space-y-3">
          {termsList.map((term, i) => (
            <div key={i} className="flex gap-3 text-sm text-muted-foreground">
              <span className="text-primary font-semibold shrink-0">{i + 1}.</span>
              <span className="leading-relaxed">{term}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="bg-white/5 border-white/10 rounded-xl resize-none text-sm leading-relaxed font-mono"
            placeholder="Enter your terms and conditions..."
          />
          <p className="text-xs text-muted-foreground">
            Each line will be numbered automatically on the customer page.
          </p>
        </div>
      )}

      <Button
        onClick={publish}
        disabled={saving}
        className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 rounded-xl gap-2 w-full sm:w-auto py-2.5"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
        Publish Terms
      </Button>
    </div>
  );
}
