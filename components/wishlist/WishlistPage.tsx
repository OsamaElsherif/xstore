'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Trash2, ShoppingBag } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { WishlistWithProduct } from '@/types';
import { getProductImageUrl } from '@/lib/supabase/storage';

interface WishlistPageProps {
  initialItems: WishlistWithProduct[];
}

export default function WishlistPage({ initialItems }: WishlistPageProps) {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const { toggleWishlist } = useWishlist();
  const [items, setItems] = useState(initialItems);

  const handleRemove = async (productId: string) => {
    setItems(prev => prev.filter(item => item.product_id !== productId));
    await toggleWishlist(productId);
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-24 h-24 bg-brand-light rounded-full flex items-center justify-center mb-6">
          <ShoppingBag size={48} className="text-brand-gray/40" />
        </div>
        <h1 className="text-3xl font-display font-bold text-brand-dark mb-4">Your wishlist is empty</h1>
        <p className="text-brand-gray mb-8 max-w-md">
          Looks like you haven't added any items to your wishlist yet. Explore our collection and find something you love!
        </p>
        <Link 
          href="/" 
          className="bg-brand-dark text-brand-light px-8 py-3 rounded-xl font-bold hover:bg-brand-orange hover:text-brand-dark transition-all"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between border-b border-brand-gray/10 pb-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-brand-dark mb-2">My Wishlist</h1>
          <p className="text-brand-dark/60">You have {items.length} items saved in your wishlist.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {items.map((item) => {
          const product = item.products;
          const name = language === 'ar' ? product.name_ar : product.name_en;
          
          return (
            <div key={item.id} className="flex flex-col sm:flex-row gap-6 bg-white p-6 rounded-2xl border border-brand-gray/20 shadow-sm group hover:shadow-md transition-all">
              {/* Image */}
              <Link 
                href={`/products/${product.id}`}
                className="relative w-full sm:w-32 aspect-square rounded-xl overflow-hidden bg-brand-light/30 flex-shrink-0"
              >
                <Image
                  src={getProductImageUrl(product.image_url) || '/placeholder-product.png'}
                  alt={name}
                  fill
                  className="object-contain p-4"
                />
              </Link>

              {/* Info */}
              <div className="flex-1 flex flex-col justify-center">
                <Link href={`/products/${product.id}`} className="hover:text-brand-orange transition-colors">
                  <h3 className="text-xl font-bold text-brand-dark mb-1">{name}</h3>
                </Link>
                <p className="text-brand-orange font-bold text-lg">
                  {t('egp')} {product.price.toLocaleString()}
                </p>
                {!product.is_service && (
                  <p className={`text-sm mt-2 font-medium ${(product.stock_quantity ?? 0) > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {(product.stock_quantity ?? 0) > 0
                      ? `${(product.stock_quantity ?? 0).toLocaleString()} ${t('units')}`
                      : t('outOfStock')}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-row sm:flex-col gap-3 justify-center">
                <button
                  onClick={() => addToCart(product)}
                  disabled={!product.is_service && product.stock_quantity === 0}
                  className="flex-1 sm:flex-none px-6 py-3 bg-brand-dark text-brand-light rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-brand-orange hover:text-brand-dark transition-all disabled:opacity-50"
                >
                  <ShoppingCart size={18} />
                  {t('addToCart')}
                </button>
                <button
                  onClick={() => handleRemove(product.id)}
                  className="p-3 text-brand-gray hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  title="Remove from wishlist"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
