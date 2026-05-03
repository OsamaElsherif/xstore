'use client';

import Link from 'next/link';
import { CheckCircle2, ShoppingBag } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function SuccessContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order');

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-brand-gray/10">
      <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 size={40} />
      </div>
      <h1 className="text-3xl font-display font-bold text-brand-dark mb-4">{t('checkoutSuccess')}</h1>
      {orderNumber && (
        <div className="mb-6 p-4 bg-brand-light/50 rounded-xl">
          <p className="text-sm text-brand-gray mb-1">{t('orderNumber')}</p>
          <p className="text-2xl font-bold text-brand-orange">{orderNumber}</p>
        </div>
      )}
      <p className="text-brand-gray mb-8">
        {t('thankYou')}
      </p>
      <Link 
        href="/"
        className="inline-flex items-center justify-center w-full py-3 bg-brand-dark text-white rounded-xl font-medium hover:bg-brand-orange hover:text-brand-dark transition-colors"
      >
        {t('home')}
      </Link>
    </div>
  );
}

export default function CheckoutSuccess() {
  return (
    <main className="min-h-screen flex flex-col bg-brand-light/30">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-6">
        <Suspense fallback={<div>Loading...</div>}>
          <SuccessContent />
        </Suspense>
      </div>
      <Footer />
    </main>
  );
}
