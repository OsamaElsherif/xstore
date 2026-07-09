'use client';

import { Product } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star, SearchX, ArrowRight } from 'lucide-react';
import { getProductImageUrl } from '@/lib/supabase/storage';
import WishlistButton from '../products/WishlistButton';

interface SearchResultsPageProps {
  query: string;
  initialResults: Product[];
}

export default function SearchResultsPage({ query, initialResults }: SearchResultsPageProps) {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-brand-gray/10 pb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-brand-dark mb-2">
            Search Results for: <span className="text-brand-orange">"{query}"</span>
          </h1>
          <p className="text-brand-dark/60 font-medium">
            We found <span className="text-brand-dark font-bold">{initialResults.length}</span> products matching your search.
          </p>
        </div>
      </div>

      {initialResults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {initialResults.map((product) => {
            const name = language === 'ar' ? product.name_ar : product.name_en;
            return (
              <div key={product.id} className="group bg-white rounded-[2rem] overflow-hidden border border-brand-gray/10 hover:shadow-2xl hover:shadow-brand-dark/5 transition-all duration-500 flex flex-col h-full relative">
                {/* Wishlist */}
                <WishlistButton 
                  productId={product.id} 
                  size="sm" 
                  className="absolute top-4 ltr:right-4 rtl:left-4 z-10 p-2.5 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm hover:bg-white transition-colors"
                />

                {/* Image */}
                <Link href={`/products/${product.id}`} className="relative aspect-square bg-brand-light/30 overflow-hidden block">
                  <Image
                    src={getProductImageUrl(product.image_url) || '/placeholder-product.png'}
                    alt={name}
                    fill
                    className="object-contain p-8 transition-transform duration-700 group-hover:scale-110"
                  />
                  {product.stock_quantity === 0 && !product.is_service && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="px-4 py-2 bg-brand-dark text-white text-[10px] font-black rounded-lg uppercase tracking-widest">Out of Stock</span>
                    </div>
                  )}
                </Link>

                {/* Content */}
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Star size={14} className="fill-brand-orange text-brand-orange" />
                    <span className="text-xs font-black text-brand-dark">{product.rating || 0}</span>
                  </div>

                  <Link href={`/products/${product.id}`} className="block mb-2 group-hover:text-brand-orange transition-colors">
                    <h3 className="font-bold text-brand-dark line-clamp-2 leading-tight text-lg">{name}</h3>
                  </Link>

                  <p className="text-2xl font-black text-brand-orange mt-auto mb-8">
                    <span className="text-xs font-medium ltr:mr-1 rtl:ml-1">{t('egp')}</span>
                    {product.price.toLocaleString()}
                  </p>

                  <button
                    onClick={() => addToCart(product)}
                    disabled={product.stock_quantity === 0 && !product.is_service}
                    className="w-full py-4 bg-brand-dark text-brand-light rounded-[1.25rem] font-bold text-sm flex items-center justify-center gap-3 hover:bg-brand-orange hover:text-brand-dark transition-all active:scale-95 disabled:opacity-50"
                  >
                    <ShoppingCart size={18} />
                    {product.is_service ? "Book Service" : t('addToCart')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[3rem] border border-brand-gray/10 shadow-sm">
          <div className="w-24 h-24 bg-brand-light rounded-full flex items-center justify-center mb-8">
            <SearchX size={48} className="text-brand-gray/40" />
          </div>
          <h3 className="text-3xl font-display font-bold text-brand-dark mb-4">No results found</h3>
          <p className="text-brand-gray max-w-sm mx-auto mb-10 leading-relaxed">
            We couldn't find any products matching <span className="font-bold text-brand-dark">"{query}"</span>. 
            Try checking for typos or searching for more general terms like "iPhone" or "Case".
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-3 bg-brand-dark text-brand-light px-10 py-4 rounded-[1.5rem] font-bold hover:bg-brand-orange hover:text-brand-dark transition-all group"
          >
            Browse Categories
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  );
}
