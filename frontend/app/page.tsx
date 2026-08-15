import { getPublicData } from '@/lib/public-data';
import { ProfileHeader } from '@/components/public/profile-header';
import { ServiceCard } from '@/components/public/service-card';
import { Sparkles } from 'lucide-react';
import type { Service, Category } from '@/lib/supabase';

export default async function HomePage() {
  const data = await getPublicData();
  const enabledServices = data.services.filter((s) => s.enabled);

  const servicesByCategory = data.categories
    .map((cat) => ({
      category: cat,
      services: enabledServices
        .filter((s) => s.category_id === cat.id)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
    }))
    .filter((group) => group.services.length > 0);

  const categorizedIds = new Set(servicesByCategory.flatMap((g) => g.services.map((s) => s.id)));
  const uncategorizedServices = enabledServices.filter((s) => !categorizedIds.has(s.id));

  if (uncategorizedServices.length > 0) {
    servicesByCategory.push({
      category: { id: 'uncategorized', name: 'Other Services', position: 999, created_at: new Date().toISOString() },
      services: uncategorizedServices.sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
    });
  }

  return (
    <main className="relative min-h-screen">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-primary/10 rounded-full blur-[100px] sm:blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-secondary/10 rounded-full blur-[100px] sm:blur-[120px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10 md:py-12">
        <ProfileHeader profile={data.profile} />

        {/* Services Catalogue */}
        <div className="mt-8 sm:mt-12 md:mt-14">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <Sparkles size={20} className="text-primary shrink-0 sm:w-5 sm:h-5" />
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
              Services
            </h2>
          </div>

          {servicesByCategory.length === 0 ? (
            <div className="glass-card p-8 sm:p-12 text-center">
              <p className="text-muted-foreground text-sm sm:text-base">
                No services available at the moment. Please check back later.
              </p>
            </div>
          ) : (
            <div className="space-y-8 sm:space-y-12">
              {servicesByCategory.map(({ category, services }, idx) => (
                <section
                  key={category.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <h3 className="text-sm sm:text-base md:text-lg font-semibold text-white/90 mb-3 sm:mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 sm:h-5 bg-gradient-to-b from-primary to-secondary rounded-full shrink-0" />
                    {category.name}
                  </h3>
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
                    {services.map((service: Service) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        category={category}
                        reviews={data.reviews}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
