'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Hero() {
  const { t, language } = useLanguage();
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;

  return (
    <section className="bg-brand-dark text-brand-light py-12 md:py-24 overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 ltr:right-0 rtl:left-0 -translate-y-1/4 ltr:translate-x-1/4 rtl:-translate-x-1/4 w-96 h-96 bg-brand-orange/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 ltr:left-0 rtl:right-0 translate-y-1/4 ltr:-translate-x-1/4 rtl:translate-x-1/4 w-64 h-64 bg-brand-gray/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 ltr:md:pr-8 rtl:md:pl-8">
            <div className="inline-block px-3 py-1 bg-brand-orange/10 border border-brand-orange/20 rounded-full text-brand-orange text-sm font-medium tracking-wide uppercase">
              {t('newCollection')}
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight tracking-tight">
              {t('heroTitle1')} <br />
              <span className="text-brand-orange">{t('heroTitle2')}</span> {t('heroTitle3')}
            </h1>
            <p className="text-brand-gray text-lg md:text-xl max-w-lg leading-relaxed">
              {t('heroDesc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/shop" className="bg-brand-orange text-brand-dark px-8 py-4 rounded-full font-semibold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 group">
                {t('shopNow')}
                <ArrowIcon size={18} className="ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform" />
              </Link>
              <button className="bg-transparent border border-brand-gray/30 text-brand-light px-8 py-4 rounded-full font-semibold hover:bg-brand-gray/10 transition-all">
                {t('viewLookbook')}
              </button>
            </div>
          </div>
          
          <div className="relative h-[400px] md:h-[500px] lg:h-[600px] w-full rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
            <Image
              src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop"
              alt="Hero Product"
              fill
              className="object-cover"
              priority
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-transparent to-transparent"></div>
            <div className="absolute bottom-6 left-6 right-6 bg-brand-light/10 backdrop-blur-md border border-brand-light/20 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-sm text-brand-gray">{t('featuredProduct')}</p>
                <p className="font-bold text-lg">{t('latestFlagship')}</p>
              </div>
              <div className="bg-brand-orange text-brand-dark font-bold px-4 py-2 rounded-lg">
                EGP 49,950
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
