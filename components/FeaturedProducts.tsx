'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Star, ChevronRight, ChevronLeft } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types';
import { getProductImageUrl } from '@/lib/supabase/storage';
import WishlistButton from './products/WishlistButton';

interface FeaturedProductsProps {
  id?: string;
  titleKey: string;
  subtitleKey: string;
  products: Product[];
  viewAllTextKey: string;
  categorySlug?: string;
}

export default function FeaturedProducts({ id, titleKey, subtitleKey, products, viewAllTextKey, categorySlug }: FeaturedProductsProps) {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();

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
          <div key={product.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-brand-gray/20 hover:shadow-xl hover:shadow-brand-dark/5 transition-all duration-300">
            {/* Image Container */}
            <Link href={`/products/${product.id}`} className="relative aspect-square overflow-hidden bg-brand-light/30 block">
              {product.badge && (
                <div className="absolute top-4 ltr:left-4 rtl:right-4 z-10 bg-brand-orange text-brand-dark text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  {t(product.badge.toLowerCase() as any) || product.badge}
                </div>
              )}
              {product.image_url && (
                <Image
                  src={getProductImageUrl(product.image_url) || ''}
                  alt={language === 'ar' ? product.name_ar : product.name_en}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
              )}
            </Link>

            {/* Content */}
            <div className="p-5 flex flex-col flex-grow">
              <Link href={`/products/${product.id}`} className="block group/link">
                <div className="flex items-center gap-1 mb-2">
                  <Star size={14} className="fill-brand-orange text-brand-orange" />
                  <span className="text-sm font-medium text-brand-dark">{product.rating}</span>
                  <span className="text-xs text-gray-500">({product.reviews_count})</span>
                </div>
                <h3 className="font-bold text-brand-dark mb-1 line-clamp-1 group-hover/link:text-brand-orange transition-colors" title={language === 'ar' ? product.name_ar : product.name_en}>
                  {language === 'ar' ? product.name_ar : product.name_en}
                </h3>
              </Link>
              <p className="text-brand-dark/70 font-medium mb-4 flex-grow">
                {t('egp')} {product.price.toLocaleString()}
              </p>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => addToCart(product)}
                  className="flex-1 py-3 rounded-xl bg-brand-dark text-brand-light font-semibold flex items-center justify-center gap-2 hover:bg-brand-orange hover:text-brand-dark transition-colors"
                >
                  <ShoppingCart size={18} />
                  {t('addToCart')}
                </button>
                <WishlistButton 
                  productId={product.id} 
                  size="sm" 
                  className="p-3 bg-brand-light/50 rounded-xl"
                />
              </div>
            </div>
          </div>
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
