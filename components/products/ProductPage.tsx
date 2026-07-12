'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star, Minus, Plus, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Product, Category, Offer, computeDiscountedPrice } from '@/types';
import { getProductImageUrl } from '@/lib/supabase/storage';
import WishlistButton from './WishlistButton';
import { createClient } from '@/lib/supabase/client';
import PriceDisplay from './PriceDisplay';

interface ProductPageProps {
  product: Product & { categories: Category | null };
  relatedProducts: Product[];
  activeOffer?: Offer | null;
}

export default function ProductPage({ product, relatedProducts, activeOffer }: ProductPageProps) {
  const [quantity, setQuantity] = useState(1);
  const [currentStock, setCurrentStock] = useState<number | null>(product.stock_quantity);
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`product-stock-${product.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'products',
          filter: `id=eq.${product.id}`,
        },
        (payload) => {
          setCurrentStock(payload.new.stock_quantity);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [product.id, supabase]);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product, activeOffer);
    }
  };

  const name = language === 'ar' ? product.name_ar : product.name_en;
  const description = language === 'ar' ? product.description_ar : product.description_en;
  const categoryName = product.categories ? (language === 'ar' ? product.categories.name_ar : product.categories.name_en) : '';

  return (
    <div className="space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-brand-dark/60">
        <Link href="/" className="hover:text-brand-orange transition-colors">{t('home')}</Link>
        {language === 'ar' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        {product.categories && (
          <>
            <Link href={`/#${product.categories.slug}`} className="hover:text-brand-orange transition-colors">
              {categoryName}
            </Link>
            {language === 'ar' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
          </>
        )}
        <span className="text-brand-dark font-medium line-clamp-1">{name}</span>
      </nav>

      {/* Product Details */}
      <div className="flex flex-col md:flex-row gap-12">
        {/* Image Section */}
        <div className="w-full md:w-1/2 aspect-square relative rounded-3xl overflow-hidden bg-white border border-brand-gray/20 shadow-sm">
          {product.badge && (
            <div className="absolute top-6 ltr:left-6 rtl:right-6 z-10 bg-brand-orange text-brand-dark text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider">
              {product.badge}
            </div>
          )}
          <Image
            src={getProductImageUrl(product.image_url) || '/placeholder-product.png'}
            alt={name}
            fill
            className="object-contain p-8"
            priority
          />
        </div>

        {/* Info Section */}
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex items-center gap-1 text-brand-orange">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={18} 
                  className={i < Math.floor(product.rating || 0) ? "fill-brand-orange" : "text-brand-gray/30"} 
                />
              ))}
            </div>
            <span className="text-sm font-medium text-brand-dark/60">({product.reviews_count || 0} reviews)</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-display font-bold text-brand-dark mb-4">{name}</h1>
          
          <div className="mb-6">
            <PriceDisplay
              originalPrice={product.price}
              discountedPrice={activeOffer ? computeDiscountedPrice(product.price, activeOffer) : null}
              activeOffer={activeOffer}
              size="lg"
            />
          </div>

          <div className="prose prose-brand max-w-none mb-8 text-brand-dark/70 leading-relaxed">
            {description || 'No description available.'}
          </div>

          {/* Stock Status */}
          <div className="mb-8">
            {!product.is_service && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-brand-dark/60">Status:</span>
                  {currentStock !== null && currentStock > 0 ? (
                    <span className="text-sm font-bold text-green-600">
                      {currentStock.toLocaleString()} {t('units')}
                    </span>
                  ) : (
                    <span className="text-sm font-bold text-red-500">{t('outOfStock')}</span>
                  )}
                </div>
                
                {currentStock !== null && currentStock > 0 && currentStock < 5 && (
                  <div className="flex items-center gap-2 p-3 bg-yellow-50 text-yellow-800 rounded-xl border border-yellow-100 text-sm font-medium">
                    <AlertCircle size={18} />
                    {t('lowStock').replace('{n}', String(currentStock))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-auto space-y-4">
            {!product.is_service && currentStock !== null && currentStock > 0 && (
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-brand-gray/20 rounded-xl overflow-hidden bg-white">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-brand-gray/5 transition-colors text-brand-dark"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="w-12 text-center font-bold text-brand-dark">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(currentStock ?? 0, quantity + 1))}
                    className="p-3 hover:bg-brand-gray/5 transition-colors text-brand-dark"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={!product.is_service && (currentStock === 0 || currentStock === null)}
                className="flex-1 bg-brand-dark text-brand-light py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 hover:bg-brand-orange hover:text-brand-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-dark/10"
              >
                <ShoppingCart size={22} />
                {product.is_service ? "Book Service" : t('addToCart')}
              </button>
              
              <WishlistButton 
                productId={product.id} 
                size="lg" 
                className="p-4 bg-white border border-brand-gray/20 rounded-2xl shadow-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-brand-dark mb-2">Related Products</h2>
              <p className="text-brand-dark/60">You might also like these items from the same category.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Simple ProductCard component for related products
function ProductCard({ product }: { product: Product }) {
  const { t, language } = useLanguage();
  const name = language === 'ar' ? product.name_ar : product.name_en;
  
  return (
    <Link href={`/products/${product.id}`} className="group bg-white rounded-2xl overflow-hidden border border-brand-gray/20 hover:shadow-xl transition-all flex flex-col h-full">
      <div className="relative aspect-square bg-brand-light/30">
        <Image
          src={getProductImageUrl(product.image_url) || '/placeholder-product.png'}
          alt={name}
          fill
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-brand-dark mb-1 line-clamp-1 group-hover:text-brand-orange transition-colors">{name}</h3>
        <p className="text-brand-orange font-bold mt-auto">{t('egp')} {product.price.toLocaleString()}</p>
      </div>
    </Link>
  );
}
