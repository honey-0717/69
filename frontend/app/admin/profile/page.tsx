'use client';

import { useEffect, useState, useRef } from 'react';
import type { Profile } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Upload, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { logAdminActivity } from '@/lib/activity';
import { apiRequest, apiUpload } from '@/lib/api-client';

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [languages, setLanguages] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    apiRequest<Profile>('/api/profile').then(({ data }) => {
      setProfile(data);
      setDisplayName(data?.display_name ?? '');
      setBio(data?.bio ?? '');
      setLanguages(data?.languages?.join(', ') ?? '');
      setPhotoUrl(data?.profile_photo ?? '');
      setLoading(false);
    });
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPEG, PNG, WEBP)');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const { data, error } = await apiUpload<{ url: string }>('/api/profile/upload', formData);

      if (!error && data?.url) {
        setPhotoUrl(data.url);
        toast.success('Profile photo updated from gallery/files!');
      } else {
        const reader = new FileReader();
        reader.onload = (evt) => {
          const result = evt.target?.result as string;
          if (result) {
            setPhotoUrl(result);
            toast.success('Photo selected!');
          }
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const result = evt.target?.result as string;
        if (result) {
          setPhotoUrl(result);
          toast.success('Photo selected!');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  async function save() {
    if (!displayName.trim()) {
      toast.error('Display name is required');
      return;
    }
    setSaving(true);
    const langs = languages
      .split(',')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    try {
      const payload = {
        display_name: displayName.trim(),
        bio: bio.trim() || null,
        languages: langs,
        profile_photo: photoUrl.trim() || null,
      };

      const { data, error } = await apiRequest<Profile>('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (!error && data) {
        setProfile(data);
        setDisplayName(data.display_name ?? '');
        setBio(data.bio ?? '');
        setLanguages(data.languages?.join(', ') ?? '');
        setPhotoUrl(data.profile_photo ?? '');
        toast.success('Profile updated successfully');
        logAdminActivity('profile_updated', `Updated public profile for ${displayName.trim()}`);
      } else {
        toast.error('Failed to save profile: ' + (error || 'Server error'));
      }
    } catch (e: any) {
      toast.error('Failed to save profile: ' + (e?.message || 'Unexpected error'));
    } finally {
      setSaving(false);
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
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Profile Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Manage your public profile & avatar</p>
      </div>

      {/* Profile Photo Direct Gallery / File Uploader */}
      <div className="glass-card p-6 space-y-4">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Profile Photo
        </Label>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative shrink-0">
            <div className="relative w-28 h-28 rounded-full p-[2px] bg-gradient-to-tr from-[#ff2a85] to-[#ff60a8] shadow-[0_0_20px_rgba(255,42,133,0.35)] overflow-hidden">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt="Profile preview"
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-white/10 flex items-center justify-center">
                  <ImageIcon size={32} className="text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-3 text-center sm:text-left">
            <div>
              <p className="text-sm font-semibold text-white">Upload Avatar Photo</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pick a photo directly from your mobile gallery or computer files
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 rounded-xl gap-2 text-xs font-semibold px-5 py-2.5"
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {uploading ? 'Processing photo...' : 'Choose Photo from Gallery / Files'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Display Name */}
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Display Name</Label>
        <Input
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Your display name"
          className="bg-white/5 border-white/10 rounded-xl"
        />
      </div>

      {/* Bio */}
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Bio</Label>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="A short introduction about yourself..."
          rows={4}
          className="bg-white/5 border-white/10 rounded-xl resize-none"
        />
      </div>

      {/* Languages */}
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Languages</Label>
        <Input
          value={languages}
          onChange={(e) => setLanguages(e.target.value)}
          placeholder="English, Hindi"
          className="bg-white/5 border-white/10 rounded-xl"
        />
        <p className="text-xs text-muted-foreground">Separate with commas</p>
      </div>

      <Button
        onClick={save}
        disabled={saving}
        className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 rounded-xl gap-2 w-full sm:w-auto"
      >
        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
        Save Profile
      </Button>
    </div>
  );
}
