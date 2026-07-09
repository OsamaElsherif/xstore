import { getOrderByNumber } from '@/lib/actions/orders';
import { getMaintenanceRequestByNumber } from '@/lib/actions/maintenance';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TrackingLookup from '@/components/tracking/TrackingLookup';
import OrderTracker from '@/components/tracking/OrderTracker';
import MaintenanceTracker from '@/components/tracking/MaintenanceTracker';
import { Suspense } from 'react';

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; ref?: string }>;
}) {
  const { type, ref } = await searchParams;

  let result: any = null;
  if (type && ref) {
    if (type === 'order') {
      result = await getOrderByNumber(ref);
    } else if (type === 'maintenance') {
      result = await getMaintenanceRequestByNumber(ref);
    }
  }

  return (
    <main className="min-h-screen flex flex-col bg-brand-light/30">
      <Navbar />
      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <Suspense fallback={<div className="text-center py-20">Looking up your reference...</div>}>
          {!type || !ref ? (
            <TrackingLookup />
          ) : result ? (
            type === 'order' ? (
              <OrderTracker order={result} />
            ) : (
              <MaintenanceTracker request={result} />
            )
          ) : (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-brand-gray/10 shadow-sm">
              <h2 className="text-2xl font-display font-bold text-brand-dark mb-4">Reference Not Found</h2>
              <p className="text-brand-gray mb-8">We couldn't find any {type} with the reference number: <span className="font-bold">{ref}</span></p>
              <TrackingLookup initialType={type as any} />
            </div>
          )}
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
