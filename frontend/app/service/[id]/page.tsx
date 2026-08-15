import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPublicData } from '@/lib/public-data';
import { PhotoGallery } from '@/components/public/photo-gallery';
import { ReviewsSection } from '@/components/public/reviews-section';
import { PaymentMethodsSection } from '@/components/public/payment-methods-section';
import { ServiceDetailClient } from '@/components/public/service-detail-client';
import { Clock, IndianRupee, ChevronLeft, Info, AlertTriangle } from 'lucide-react';
import { formatPrice } from '@/lib/helpers';
import { DEFAULT_TERMS, DEFAULT_MESSAGE_TEMPLATE } from '@/lib/constants';
import { getServiceReviews } from '@/lib/reviews-data';

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

  const category = data.categories.find((c) => c.id === service.category_id);
  const enabledPaymentMethods = data.paymentMethods.filter((m) => m.enabled);
  const enabledContacts = data.socialContacts.filter((c) => c.enabled);
  const reviewData = getServiceReviews(service.id, data.reviews);

  return (
    <main className="relative min-h-screen">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-white transition-colors mb-6"
        >
          <ChevronLeft size={16} />
          Back to all services
        </Link>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Left: Gallery */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="aspect-[4/5] w-full">
              <PhotoGallery photos={service.photos} name={service.name} className="w-full h-full" />
            </div>
          </div>

          {/* Right: Details */}
          <div className="space-y-5">
            {/* Header */}
            <div className="animate-fade-in-up">
              {category && (
                <span className="inline-block glass px-3 py-1 rounded-full text-[10px] font-medium text-white/90 uppercase tracking-wider mb-3">
                  {category.name}
                </span>
              )}
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-4">
                {service.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5 text-2xl font-bold text-primary">
                  <IndianRupee size={22} />
                  {service.price.toLocaleString('en-IN')}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock size={18} />
                  <span>{service.duration}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-warning text-lg">★</span>
                <span className="font-semibold text-white">{reviewData.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">/ 5</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{reviewData.count} Reviews</span>
              </div>
            </div>

            {/* Short description */}
            {service.short_description && (
              <p className="text-white/80 leading-relaxed animate-fade-in-up animation-delay-100">
                {service.short_description}
              </p>
            )}

            {/* Full details */}
            {service.full_description && (
              <div className="glass-card p-5 animate-fade-in-up animation-delay-200">
                <div className="flex items-center gap-2 mb-3">
                  <Info size={16} className="text-accent" />
                  <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Full Details</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {service.full_description}
                </p>
              </div>
            )}

            {/* Important info */}
            {service.important_info && (
              <div className="glass-card p-5 border-warning/20 animate-fade-in-up animation-delay-300">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} className="text-warning" />
                  <h3 className="font-semibold text-white text-sm uppercase tracking-wider">Important Information</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {service.important_info}
                </p>
              </div>
            )}

            {/* Payment methods */}
            <PaymentMethodsSection
              methods={enabledPaymentMethods}
              className="animate-fade-in-up animation-delay-300"
            />

            {/* Terms & Contact (client component) */}
            <ServiceDetailClient
              service={service}
              terms={data.terms?.content || DEFAULT_TERMS}
              messageTemplate={data.messageTemplate?.template || DEFAULT_MESSAGE_TEMPLATE}
              contacts={enabledContacts}
            />

            {/* Reviews */}
            <div className="pt-4">
              <h3 className="font-display text-xl font-bold text-white mb-4">Customer Reviews ({reviewData.count})</h3>
              <ReviewsSection reviews={reviewData.reviews} totalCount={reviewData.count} rating={reviewData.rating} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
