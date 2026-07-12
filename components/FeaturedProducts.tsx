'use client';

import Link from 'next/link';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Product } from '@/types';
import ProductCard from '@/components/shop/ProductCard';

interface FeaturedProductsProps {
  id?: string;
  titleKey: string;
  subtitleKey: string;
  products: (Product & {
    categories?: any;
    active_offer?: any;
    discounted_price?: any;
  })[];
  viewAllTextKey: string;
  categorySlug?: string;
}

export default function FeaturedProducts({ id, titleKey, subtitleKey, products, viewAllTextKey, categorySlug }: FeaturedProductsProps) {
  const { t, language } = useLanguage();

  return (
    <section id={id} className="pt-4 pb-16 border-b border-brand-gray/10 last:border-0 scroll-mt-24">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-brand-dark mb-3">
            {t(titleKey as any)}
          </h2>
          <p className="text-brand-dark/60 max-w-2xl">
            {t(subtitleKey as any)}
          </p>
        </div>
        <Link 
          href={categorySlug ? `/shop?category=${categorySlug}` : '/shop'}
          className="hidden sm:flex items-center gap-2 text-brand-orange font-bold hover:underline"
        >
          {t(viewAllTextKey as any)}
          {language === 'ar' ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} view="grid" />
        ))}
      </div>
      
      <div className="mt-10 text-center md:text-start">
        <Link 
          href={categorySlug ? `/shop?category=${categorySlug}` : '/shop'}
          className="inline-flex items-center justify-center px-8 py-3 border-2 border-brand-dark text-brand-dark font-bold rounded-full hover:bg-brand-dark hover:text-brand-light transition-colors"
        >
          {t(viewAllTextKey as any)}
        </Link>
      </div>
    </section>
  );
}
