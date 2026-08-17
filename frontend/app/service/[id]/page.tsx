import { notFound } from 'next/navigation';
import { getPublicData } from '@/lib/public-data';
import { ServiceDetailView } from '@/components/public/service-detail-view';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateStaticParams() {
  try {
    const data = await getPublicData();
    return data.services.map((service) => ({
      id: service.id,
    }));
  } catch (error) {
    return [];
  }
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getPublicData();
  const service = data.services.find((s) => s.id === id);

  if (!service) {
    notFound();
  }

  return <ServiceDetailView serviceId={id} initialData={data} />;
}
