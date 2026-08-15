'use client';

import { useState } from 'react';
import { ProfileHeader } from '@/components/public/profile-header';
import { ServiceCard } from '@/components/public/service-card';
import { Sparkles, LayoutGrid, List, MessageCircle, Send, Check } from 'lucide-react';
import type { Profile, Service, Category, Review, SocialContact } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export function HomeClient({
  profile,
  categories,
  servicesByCategory,
  reviews,
  socialContacts,
}: {
  profile: Profile | null;
  categories: Category[];
  servicesByCategory: { category: Category; services: Service[] }[];
  reviews: Review[];
  socialContacts: SocialContact[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
      {/* Profile Banner */}
      <ProfileHeader profile={profile} />

      {/* Sticky Category Filter & View Controls */}
      <div className="sticky top-2 z-40 bg-[#0d0512]/80 backdrop-blur-xl border border-white/10 p-2 sm:p-3 rounded-2xl shadow-xl transition-all">
        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-0">
          {/* Category Horizontal Scroll Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 px-1 flex-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                'shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 touch-manipulation',
                selectedCategory === 'all'
                  ? 'bg-gradient-to-r from-primary to-accent text-white shadow-[0_0_15px_rgba(255,42,133,0.4)] scale-105'
                  : 'bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10'
              )}
            >
              <span>All</span>
              <span className="text-[10px] opacity-80 px-1.5 py-0.2 rounded-full bg-black/30">
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
                    'shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 touch-manipulation whitespace-nowrap',
                    isSelected
                      ? 'bg-gradient-to-r from-primary to-accent text-white shadow-[0_0_15px_rgba(255,42,133,0.4)] scale-105'
                      : 'bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10'
                  )}
                >
                  <span>{category.name}</span>
                  <span className="text-[10px] opacity-80 px-1.5 py-0.2 rounded-full bg-black/30">
                    {services.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Grid vs List View Switcher for Mobile */}
          <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-1.5 rounded-lg transition-colors touch-manipulation',
                viewMode === 'grid'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-white/50 hover:text-white'
              )}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-1.5 rounded-lg transition-colors touch-manipulation',
                viewMode === 'list'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-white/50 hover:text-white'
              )}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
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
