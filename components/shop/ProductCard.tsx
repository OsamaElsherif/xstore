'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Product, Category } from '@/types';
import { getProductImageUrl } from '@/lib/supabase/storage';
import WishlistButton from '@/components/products/WishlistButton';

interface ProductCardProps {
  product: Product & { categories?: Category | null };
  view: 'grid' | 'list';
}

export default function ProductCard({ product, view }: ProductCardProps) {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();

  const name = language === 'ar' ? product.name_ar : product.name_en;
  const description = language === 'ar' ? product.description_ar : product.description_en;
  const categoryName = product.categories
    ? (language === 'ar' ? product.categories.name_ar : product.categories.name_en)
    : null;
  const isOutOfStock = !product.is_service && (product.stock_quantity ?? 0) <= 0;

  if (view === 'list') {
    return (
      <div className="group flex bg-white rounded-2xl overflow-hidden border border-brand-gray/20 hover:shadow-xl hover:shadow-brand-dark/5 transition-all duration-300">
        {/* Image */}
        <Link href={`/products/${product.id}`} className="relative w-40 sm:w-52 shrink-0 bg-brand-light/30 block">
          {product.badge && (
            <div className="absolute top-3 ltr:left-3 rtl:right-3 z-10 bg-brand-orange text-brand-dark text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
              {t(product.badge.toLowerCase() as any) || product.badge}
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-brand-dark/50 z-10 flex items-center justify-center">
              <span className="text-white font-bold text-sm bg-brand-dark/80 px-3 py-1 rounded-full">
                {t('outOfStock')}
              </span>
            </div>
          )}
          {product.image_url && (
            <Image
              src={getProductImageUrl(product.image_url) || ''}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          )}
        </Link>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <Link href={`/products/${product.id}`} className="block group/link">
              {categoryName && (
                <p className="text-xs text-brand-dark/50 font-medium mb-1 uppercase tracking-wide">{categoryName}</p>
              )}
              <h3 className="font-bold text-brand-dark mb-1 line-clamp-1 group-hover/link:text-brand-orange transition-colors" title={name}>
                {name}
              </h3>
            </Link>
            <div className="flex items-center gap-1 mb-2">
              <Star size={13} className="fill-brand-orange text-brand-orange" />
              <span className="text-sm font-medium text-brand-dark">{product.rating ?? 0}</span>
              <span className="text-xs text-gray-500">({product.reviews_count ?? 0})</span>
            </div>
            {description && (
              <p className="text-sm text-brand-dark/60 line-clamp-2">{description}</p>
            )}
          </div>

          <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-3">
            <p className="text-lg font-bold text-brand-dark whitespace-nowrap">
              {t('egp')} {product.price.toLocaleString()}
            </p>
            <button
              onClick={() => addToCart(product)}
              disabled={isOutOfStock}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                isOutOfStock
                  ? 'bg-brand-gray/30 text-brand-dark/40 cursor-not-allowed'
                  : 'bg-brand-dark text-brand-light hover:bg-brand-orange hover:text-brand-dark'
              }`}
            >
              <ShoppingCart size={16} />
              {isOutOfStock ? t('outOfStock') : t('addToCart')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-brand-gray/20 hover:shadow-xl hover:shadow-brand-dark/5 transition-all duration-300">
      {/* Image Container */}
      <Link href={`/products/${product.id}`} className="relative aspect-square overflow-hidden bg-brand-light/30 block">
        {product.badge && (
          <div className="absolute top-4 ltr:left-4 rtl:right-4 z-10 bg-brand-orange text-brand-dark text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
            {t(product.badge.toLowerCase() as any) || product.badge}
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-brand-dark/50 z-20 flex items-center justify-center">
            <span className="text-white font-bold text-sm bg-brand-dark/80 px-4 py-1.5 rounded-full">
              {t('outOfStock')}
            </span>
          </div>
        )}
        <div className="absolute top-4 ltr:right-4 rtl:left-4 z-10">
          <WishlistButton
            productId={product.id}
            size="sm"
            className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white"
          />
        </div>
        {product.image_url && (
          <Image
            src={getProductImageUrl(product.image_url) || ''}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        )}
      </Link>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        <Link href={`/products/${product.id}`} className="block group/link">
          {categoryName && (
            <p className="text-xs text-brand-dark/50 font-medium mb-1 uppercase tracking-wide">{categoryName}</p>
          )}
          <div className="flex items-center gap-1 mb-2">
            <Star size={14} className="fill-brand-orange text-brand-orange" />
            <span className="text-sm font-medium text-brand-dark">{product.rating ?? 0}</span>
            <span className="text-xs text-gray-500">({product.reviews_count ?? 0})</span>
          </div>
          <h3 className="font-bold text-brand-dark mb-1 line-clamp-1 group-hover/link:text-brand-orange transition-colors" title={name}>
            {name}
          </h3>
        </Link>
        <p className="text-brand-dark/70 font-medium mb-4 flex-grow">
          {t('egp')} {product.price.toLocaleString()}
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => addToCart(product)}
            disabled={isOutOfStock}
            className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${
              isOutOfStock
                ? 'bg-brand-gray/30 text-brand-dark/40 cursor-not-allowed'
                : 'bg-brand-dark text-brand-light hover:bg-brand-orange hover:text-brand-dark'
            }`}
          >
            <ShoppingCart size={18} />
            {isOutOfStock ? t('outOfStock') : t('addToCart')}
          </button>
        </div>
      </div>
    </div>
  );
}
