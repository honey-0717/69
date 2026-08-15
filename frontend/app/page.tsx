import { getPublicData } from '@/lib/public-data';
import { HomeClient } from '@/components/public/home-client';
import type { Category } from '@/lib/supabase';

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
    <main className="relative min-h-screen pb-12">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-primary/10 rounded-full blur-[100px] sm:blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-secondary/10 rounded-full blur-[100px] sm:blur-[120px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-10 md:py-12">
        <HomeClient
          profile={data.profile}
          categories={data.categories}
          servicesByCategory={servicesByCategory}
          reviews={data.reviews}
          socialContacts={data.socialContacts}
        />
      </div>
    </main>
  );
}
