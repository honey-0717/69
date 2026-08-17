'use client';

import { useState } from 'react';
import { ProfileHeader } from '@/components/public/profile-header';
import { ServiceCard } from '@/components/public/service-card';
import { Sparkles, LayoutGrid, List } from 'lucide-react';
import type { Profile, Service, Category, Review, SocialContact } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { useRealtimePublicData } from '@/lib/realtime';

export function HomeClient({
  profile: initialProfile,
  categories: initialCategories,
  servicesByCategory: initialServicesByCategory,
  reviews: initialReviews,
  socialContacts: initialSocialContacts,
}: {
  profile: Profile | null;
  categories: Category[];
  servicesByCategory: { category: Category; services: Service[] }[];
  reviews: Review[];
  socialContacts: SocialContact[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const liveData = useRealtimePublicData();

  const profile = liveData?.profile ?? initialProfile;
  const categories = liveData?.categories && liveData.categories.length > 0 ? liveData.categories : initialCategories;
  const reviews = liveData?.reviews ?? initialReviews;

  const services: Service[] | null = liveData?.services ?? null;
  let servicesByCategory = initialServicesByCategory;

  if (services && Array.isArray(services)) {
    const enabledServices = services.filter((s: Service) => s.enabled);
    const catGroups = categories
      .map((cat: Category) => ({
        category: cat,
        services: enabledServices
          .filter((s: Service) => s.category_id === cat.id)
          .sort((a: Service, b: Service) => (a.position ?? 0) - (b.position ?? 0)),
      }))
      .filter((group: any) => group.services.length > 0);

    const categorizedIds = new Set(catGroups.flatMap((g: any) => g.services.map((s: Service) => s.id)));
    const uncategorized = enabledServices.filter((s: Service) => !categorizedIds.has(s.id));

    if (uncategorized.length > 0) {
      catGroups.push({
        category: { id: 'uncategorized', name: 'Other Services', position: 999, created_at: new Date().toISOString() },
        services: uncategorized.sort((a: Service, b: Service) => (a.position ?? 0) - (b.position ?? 0)),
      });
    }
    servicesByCategory = catGroups;
  }

  const filteredGroups =
    selectedCategory === 'all'
      ? servicesByCategory
      : servicesByCategory.filter((g) => g.category.id === selectedCategory);

  const totalServicesCount = servicesByCategory.reduce(
    (acc, g) => acc + g.services.length,
    0
  );

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* Profile Header Banner */}
      <ProfileHeader profile={profile} />

      {/* Sticky Mobile Filter Bar */}
      <div className="sticky top-2 z-40 bg-[#0d0512]/90 backdrop-blur-xl border border-white/10 p-2.5 sm:p-3.5 rounded-2xl shadow-2xl transition-all space-y-2.5">
        {/* Top Control Row */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary shrink-0 animate-pulse" />
            <span className="font-display text-xs sm:text-sm font-bold text-white tracking-wide">
              Catalogue
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
              {totalServicesCount} items
            </span>
          </div>

          {/* View Switcher: Grid vs List */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-0.5 sm:p-1 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-lg transition-all duration-200 touch-manipulation',
                viewMode === 'grid'
                  ? 'bg-primary text-white shadow-[0_0_10px_rgba(255,42,133,0.4)]'
                  : 'text-white/50 hover:text-white'
              )}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded-lg transition-all duration-200 touch-manipulation',
                viewMode === 'list'
                  ? 'bg-primary text-white shadow-[0_0_10px_rgba(255,42,133,0.4)]'
                  : 'text-white/50 hover:text-white'
              )}
              title="List View"
            >
              <List size={15} />
            </button>
          </div>
        </div>

        {/* Full-Width Horizontal Category Pills Row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 px-0.5 w-full">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 touch-manipulation',
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-[0_0_12px_rgba(255,42,133,0.5)] scale-105'
                : 'bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10'
            )}
          >
            <span>All</span>
            <span className="text-[10px] opacity-90 px-1.5 py-0.2 rounded-full bg-black/40 font-mono">
              {totalServicesCount}
            </span>
          </button>

          {servicesByCategory.map(({ category, services }) => {
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  'shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 touch-manipulation whitespace-nowrap',
                  isSelected
                    ? 'bg-gradient-to-r from-primary to-accent text-white shadow-[0_0_12px_rgba(255,42,133,0.5)] scale-105'
                    : 'bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                )}
              >
                <span>{category.name}</span>
                <span className="text-[10px] opacity-90 px-1.5 py-0.2 rounded-full bg-black/40 font-mono">
                  {services.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Services Content Section */}
      {filteredGroups.length === 0 ? (
        <div className="glass-card p-8 sm:p-12 text-center">
          <p className="text-muted-foreground text-sm sm:text-base">
            No services available in this category.
          </p>
        </div>
      ) : (
        <div className="space-y-8 sm:space-y-12">
          {filteredGroups.map(({ category, services }, idx) => (
            <section
              key={category.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <h3 className="text-base sm:text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-1.5 h-5 bg-gradient-to-b from-primary to-secondary rounded-full shrink-0" />
                  {category.name}
                </h3>
                <span className="text-xs text-white/50">
                  {services.length} {services.length === 1 ? 'service' : 'services'}
                </span>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                  {services.map((service: Service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      category={category}
                      reviews={reviews}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {services.map((service: Service) => (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      category={category}
                      reviews={reviews}
                      viewMode="list"
                    />
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
