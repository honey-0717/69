'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Service, Category } from '@/lib/supabase';
import { INITIAL_CATEGORIES } from '@/lib/initial-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, X, Upload, GripVertical, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { logAdminActivity } from '@/lib/activity';
import { apiRequest, apiUpload } from '@/lib/api-client';

const durationOptions = [
  '1 Minute',
  '2 Minutes',
  '5 Minutes',
  '10 Minutes',
  '15 Minutes',
  '30 Minutes',
  '1 Hour',
];

export function ServiceForm({ service }: { service?: Service | null }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [name, setName] = useState(service?.name ?? '');
  const [categoryId, setCategoryId] = useState(service?.category_id ?? '');
  const [price, setPrice] = useState(service?.price?.toString() ?? '');
  const [duration, setDuration] = useState(service?.duration ?? '5 Minutes');
  const [shortDesc, setShortDesc] = useState(service?.short_description ?? '');
  const [fullDesc, setFullDesc] = useState(service?.full_description ?? '');
  const [importantInfo, setImportantInfo] = useState(service?.important_info ?? '');
  const [enabled, setEnabled] = useState(service?.enabled ?? true);
  const [photos, setPhotos] = useState<string[]>(service?.photos ?? []);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    apiRequest<{ categories: Category[] }>('/api/public-data').then(({ data, error }) => {
      const cats = (!error && data?.categories && data.categories.length > 0) ? data.categories : (INITIAL_CATEGORIES as Category[]);
      setCategories(cats);
      if (!service && cats.length > 0) {
        setCategoryId(cats[0].id);
      }
      setFetching(false);
    });
  }, [service]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    let addedCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      try {
        const formData = new FormData();
        formData.append('file', file);

        const { data, error } = await apiUpload<{ url: string }>('/api/services/upload', formData);

        if (!error && data?.url) {
          setPhotos((prev) => [...prev, data.url]);
          addedCount++;
        } else {
          // Fallback to FileReader base64
          await new Promise<void>((resolve) => {
            const reader = new FileReader();
            reader.onload = (event) => {
              const result = event.target?.result as string;
              if (result) {
                setPhotos((prev) => [...prev, result]);
                addedCount++;
              }
              resolve();
            };
            reader.readAsDataURL(file);
          });
        }
      } catch {
        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            const result = event.target?.result as string;
            if (result) {
              setPhotos((prev) => [...prev, result]);
              addedCount++;
            }
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }
    }

    setUploading(false);
    if (addedCount > 0) {
      toast.success(`Successfully added ${addedCount} photo${addedCount > 1 ? 's' : ''} from gallery/files!`);
    } else {
      toast.error('No valid image files selected');
    }

    // Reset file input so selecting the same file again triggers onChange
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
    toast.info('Photo removed');
  };

  const movePhoto = (index: number, dir: -1 | 1) => {
    const newIndex = index + dir;
    if (newIndex < 0 || newIndex >= photos.length) return;
    const newPhotos = [...photos];
    [newPhotos[index], newPhotos[newIndex]] = [newPhotos[newIndex], newPhotos[index]];
    setPhotos(newPhotos);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Service name is required');
      return;
    }
    if (!price || isNaN(Number(price)) || Number(price) < 0) {
      toast.error('Please enter a valid price');
      return;
    }
    if (!categoryId) {
      toast.error('Please select a category');
      return;
    }

    setLoading(true);

    const payload = {
      name: name.trim(),
      category_id: categoryId,
      price: Number(price),
      duration,
      short_description: shortDesc.trim() || null,
      full_description: fullDesc.trim() || null,
      important_info: importantInfo.trim() || null,
      photos,
      enabled,
    };

    if (service?.id) {
      const { error } = await apiRequest(`/api/services/${service.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (error) {
        toast.error('Failed to save changes: ' + error);
        setLoading(false);
      } else {
        toast.success('Service updated successfully');
        logAdminActivity('service_updated', `Updated service "${name.trim()}" (₹${price})`, { id: service.id, price: Number(price) });
        router.push('/admin/services');
        router.refresh();
      }
    } else {
      const { error } = await apiRequest('/api/services', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (error) {
        toast.error('Failed to create service: ' + error);
        setLoading(false);
      } else {
        toast.success('Service created successfully');
        logAdminActivity('service_created', `Created new service "${name.trim()}" (₹${price})`, { price: Number(price) });
        router.push('/admin/services');
        router.refresh();
      }
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in max-w-2xl">
      <Link
        href="/admin/services"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors"
      >
        <ArrowLeft size={16} />
        Back to services
      </Link>

      <h1 className="font-display text-2xl font-bold text-white">
        {service ? 'Edit Service' : 'Add Service'}
      </h1>

      {/* Category */}
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Category</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="bg-white/5 border-white/10 rounded-xl">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="glass-card border-white/10">
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id} className="text-white focus:bg-white/10">
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Service Name */}
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Service Name</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Video Call - 5 Min"
          className="bg-white/5 border-white/10 rounded-xl"
        />
      </div>

      {/* Price & Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Price (₹)</Label>
          <Input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="500"
            className="bg-white/5 border-white/10 rounded-xl"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">Duration (Manual Input)</Label>
          <Input
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 5 Minutes or 1 Minute (with Dress)"
            className="bg-white/5 border-white/10 rounded-xl"
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {durationOptions.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setDuration(preset)}
                className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                  duration === preset
                    ? 'bg-primary/20 border-primary text-primary font-medium'
                    : 'bg-white/5 border-white/10 text-muted-foreground hover:text-white hover:bg-white/10'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Direct Gallery/File Photos Uploader */}
      <div className="space-y-3">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          Service Photos (Gallery & File Upload)
        </Label>

        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileUpload}
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          className="glass-card p-6 border-2 border-dashed border-white/15 hover:border-primary/50 transition-all duration-300 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-primary/20 text-white group-hover:text-primary flex items-center justify-center mb-3 transition-colors">
            {uploading ? <Loader2 size={24} className="animate-spin" /> : <Upload size={24} />}
          </div>
          <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
            {uploading ? 'Processing photos...' : 'Click to Add Photos from Gallery / Files'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Pick one or multiple photos directly from your phone gallery or files (JPEG, PNG, WEBP)
          </p>
          <Button
            type="button"
            disabled={uploading}
            className="mt-4 bg-gradient-to-r from-primary to-secondary text-white rounded-xl gap-2 text-xs font-semibold px-5"
          >
            <ImageIcon size={15} />
            {uploading ? 'Uploading...' : 'Choose Photos from Gallery / Files'}
          </Button>
        </div>

        {/* Photos List Grid Preview */}
        {photos.length > 0 && (
          <div className="space-y-2.5 mt-4">
            <p className="text-xs text-muted-foreground font-medium">
              Uploaded Photos ({photos.length}):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {photos.map((photo, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors"
                >
                  <GripVertical size={14} className="text-muted-foreground/50 shrink-0" />
                  <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-black/40 relative">
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs text-zinc-300 font-medium truncate flex-1">
                    Photo #{i + 1}
                  </span>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => movePhoto(i, -1)}
                      disabled={i === 0}
                      className="text-muted-foreground hover:text-white disabled:opacity-30 text-xs p-1"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      onClick={() => movePhoto(i, 1)}
                      disabled={i === photos.length - 1}
                      className="text-muted-foreground hover:text-white disabled:opacity-30 text-xs p-1"
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="text-muted-foreground hover:text-red-400 p-1 transition-colors"
                      title="Remove photo"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Short description */}
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Short Description</Label>
        <Input
          value={shortDesc}
          onChange={(e) => setShortDesc(e.target.value)}
          placeholder="A brief one-line description"
          className="bg-white/5 border-white/10 rounded-xl"
        />
      </div>

      {/* Full description */}
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Full Description</Label>
        <Textarea
          value={fullDesc}
          onChange={(e) => setFullDesc(e.target.value)}
          placeholder="Complete details about this service..."
          rows={4}
          className="bg-white/5 border-white/10 rounded-xl resize-none"
        />
      </div>

      {/* Important info */}
      <div className="space-y-1.5">
        <Label className="text-xs uppercase tracking-wider text-muted-foreground">Important Information</Label>
        <Textarea
          value={importantInfo}
          onChange={(e) => setImportantInfo(e.target.value)}
          placeholder="Any warnings or important notes for customers..."
          rows={3}
          className="bg-white/5 border-white/10 rounded-xl resize-none"
        />
      </div>

      {/* Availability toggle */}
      <div className="glass-card p-4 flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium text-white">Service Available</Label>
          <p className="text-xs text-muted-foreground mt-0.5">When enabled, this service appears on the public website</p>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} />
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-primary to-secondary text-white hover:opacity-90 rounded-xl gap-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          {service ? 'Save Changes' : 'Save Service'}
        </Button>
        <Link href="/admin/services">
          <Button type="button" variant="outline" className="rounded-xl border-white/10">
            Cancel
          </Button>
        </Link>
      </div>
    </form>
  );
}
