import { getPublicData } from '@/lib/public-data';
import { HomeClient } from '@/components/public/home-client';
import type { Category } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export default async function HomePage() {
  const data = await getPublicData();
  const enabledServices = data.services.filter((s) => s.enabled !== false && String(s.enabled) !== 'false');

  const isCatMatch = (sCatId: string | null | undefined, cat: Category) => {
    if (!sCatId) return false;
    if (sCatId === cat.id) return true;
    if (sCatId.toLowerCase() === cat.name?.toLowerCase()) return true;
    const aliases: Record<string, string[]> = {
      'cat-demo': ['cat-demo', 'demo', '88bef4b9-fd4b-4ad2-97fa-4f9d154721c2'],
      'cat-vc': ['cat-vc', 'video call (vc)', 'video call', 'cd53d390-1cd5-4fc1-8e11-f30d9748d46d'],
      'cat-voice': ['cat-voice', 'voice call', 'f0009287-5953-436d-8a5e-db73a37e37a6'],
      'cat-special': ['cat-special', 'special services (without face)', 'premium services', 'special services', '26be4de5-dfff-4e1f-9116-2011c7d03fe4'],
    };
    for (const list of Object.values(aliases)) {
      if (list.includes(sCatId) && list.includes(cat.id)) return true;
    }
    return false;
  };

  const servicesByCategory = data.categories
    .map((cat) => ({
      category: cat,
      services: enabledServices
        .filter((s) => isCatMatch(s.category_id, cat))
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
