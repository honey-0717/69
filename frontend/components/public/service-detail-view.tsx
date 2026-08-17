'use client';

import Link from 'next/link';
import { PhotoGallery } from '@/components/public/photo-gallery';
import { ReviewsSection } from '@/components/public/reviews-section';
import { PaymentMethodsSection } from '@/components/public/payment-methods-section';
import { ServiceDetailClient } from '@/components/public/service-detail-client';
import { Clock, IndianRupee, ChevronLeft, Info, AlertTriangle, Star, Sparkles } from 'lucide-react';
import { DEFAULT_TERMS, DEFAULT_MESSAGE_TEMPLATE } from '@/lib/constants';
import { getServiceReviews } from '@/lib/reviews-data';
import { useRealtimePublicData } from '@/lib/realtime';
import type { PublicData } from '@/lib/public-data';
import type { Service } from '@/lib/supabase';

export function ServiceDetailView({
  serviceId,
  initialData,
}: {
  serviceId: string;
  initialData: PublicData;
}) {
  const liveData = useRealtimePublicData();
  const data = liveData || initialData;

  const services = data.services && Array.isArray(data.services) && data.services.length > 0
    ? data.services
    : initialData.services;

  const service: Service | undefined = services.find((s: Service) => s.id === serviceId) ||
    initialData.services.find((s: Service) => s.id === serviceId);

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p>Service not found.</p>
      </div>
    );
  }

  const categories = data.categories || initialData.categories;
  const category = categories.find((c: any) => c.id === service.category_id);

  const paymentMethods = data.paymentMethods || initialData.paymentMethods;
  const enabledPaymentMethods = paymentMethods.filter((m: any) => m.enabled);

  const socialContacts = data.socialContacts || initialData.socialContacts;
  const enabledContacts = socialContacts.filter((c: any) => c.enabled);

  const reviews = data.reviews || initialData.reviews;
  const reviewData = getServiceReviews(service.id, reviews);

  const photos = Array.isArray(service.photos) && service.photos.length > 0 ? service.photos : [];

  return (
    <main className="relative min-h-screen pb-16">
      {/* Background Glow Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-80 sm:w-96 h-80 sm:h-96 bg-primary/15 rounded-full blur-[100px] sm:blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-80 sm:w-96 h-80 sm:h-96 bg-secondary/15 rounded-full blur-[100px] sm:blur-[120px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-3.5 sm:px-6 py-4 sm:py-10">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm text-white/80 hover:text-white hover:bg-white/10 transition-all mb-4 sm:mb-6 touch-manipulation"
        >
          <ChevronLeft size={16} />
          Back to catalogue
        </Link>

        <div className="grid lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Left: Gallery with Live Photos */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <div className="aspect-square sm:aspect-[4/5] w-full rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <PhotoGallery photos={photos} name={service.name} className="w-full h-full" />
            </div>
          </div>

          {/* Right: Details Container */}
          <div className="space-y-5">
            {/* Service Header Info */}
            <div className="animate-fade-in-up bg-black/40 backdrop-blur-xl border border-white/10 p-4 sm:p-6 rounded-3xl shadow-xl">
              {category && (
                <span className="inline-block px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold text-primary bg-primary/10 border border-primary/20 uppercase tracking-widest mb-2.5">
                  {category.name}
                </span>
              )}
              
              <h1 className="font-display text-2xl sm:text-4xl font-black text-white tracking-tight mb-3 bg-gradient-to-r from-white via-pink-100 to-primary bg-clip-text text-transparent leading-tight">
                {service.name}
              </h1>

              {/* Price & Duration Pill Cards */}
              <div className="flex flex-wrap items-center gap-3 my-4">
                <div className="flex items-center gap-1 bg-gradient-to-r from-primary/20 via-primary/10 to-accent/20 border border-primary/40 px-4 py-2 rounded-2xl text-xl sm:text-2xl font-black text-primary shadow-[0_0_15px_rgba(255,42,133,0.25)]">
                  <IndianRupee size={20} />
                  <span>{service.price.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold text-white/90">
                  <Clock size={16} className="text-primary" />
                  <span>{service.duration}</span>
                </div>

                <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-3 py-2 rounded-2xl text-xs font-bold text-amber-300">
                  <Star size={14} className="text-warning fill-warning" />
                  <span>{reviewData.rating.toFixed(1)}</span>
                  <span className="text-white/50">({reviewData.count} reviews)</span>
                </div>
              </div>

              {/* Short description highlight */}
              {service.short_description && (
                <p className="text-white/90 text-xs sm:text-sm leading-relaxed font-normal pt-2 border-t border-white/10">
                  {service.short_description}
                </p>
              )}
            </div>

            {/* Full Details Section */}
            {service.full_description && (
              <div className="glass-card p-4 sm:p-6 rounded-3xl animate-fade-in-up border border-white/10 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Info size={16} className="text-primary shrink-0" />
                  <h3 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider">
                    Full Service Details
                  </h3>
                </div>
                <div className="text-xs sm:text-sm text-white/80 leading-relaxed whitespace-pre-line font-normal space-y-2">
                  {service.full_description}
                </div>
              </div>
            )}

            {/* Important Info Section */}
            {service.important_info && (
              <div className="glass-card p-4 sm:p-6 rounded-3xl border-warning/30 bg-amber-950/20 animate-fade-in-up shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} className="text-warning shrink-0" />
                  <h3 className="font-bold text-warning text-xs sm:text-sm uppercase tracking-wider">
                    Important Rules &amp; Guidelines
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-warning/90 leading-relaxed whitespace-pre-line font-normal">
                  {service.important_info}
                </p>
              </div>
            )}

            {/* Payment Methods Section */}
            <PaymentMethodsSection
              methods={enabledPaymentMethods}
              className="animate-fade-in-up"
            />

            {/* Terms & Instant Booking Actions */}
            <ServiceDetailClient
              service={service}
              terms={data.terms?.content || DEFAULT_TERMS}
              messageTemplate={data.messageTemplate?.template || DEFAULT_MESSAGE_TEMPLATE}
              contacts={enabledContacts}
            />

            {/* Customer Reviews Section */}
            <div className="pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-400" />
                  Client Reviews
                </h3>
                <span className="text-xs text-white/60">
                  {reviewData.count} verified ratings
                </span>
              </div>
              <ReviewsSection reviews={reviewData.reviews} totalCount={reviewData.count} rating={reviewData.rating} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
