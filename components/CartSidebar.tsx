'use client';

import { X, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { getProductImageUrl } from '@/lib/supabase/storage';

export default function CartSidebar() {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { t, language } = useLanguage();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Sidebar */}
      <div 
        className={`fixed top-0 ${language === 'ar' ? 'left-0' : 'right-0'} w-full sm:w-96 h-full bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-gray/20">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-brand-orange" size={24} />
            <h2 className="font-display font-bold text-xl text-brand-dark">Your Cart</h2>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="p-2 text-brand-gray hover:text-brand-orange hover:bg-brand-light rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-20 h-20 bg-brand-light rounded-full flex items-center justify-center text-brand-gray">
                <ShoppingBag size={40} />
              </div>
              <div>
                <h3 className="font-bold text-brand-dark text-lg mb-1">Your cart is empty</h3>
                <p className="text-brand-gray text-sm">Looks like you haven&apos;t added anything yet.</p>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="mt-4 px-6 py-2 bg-brand-dark text-white rounded-full font-medium hover:bg-brand-orange hover:text-brand-dark transition-colors"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => (
                <li key={item.id} className="flex gap-4">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-brand-light border border-brand-gray/20 flex-shrink-0">
                    {item.image_url && (
                      <Image
                        src={getProductImageUrl(item.image_url) || ''}
                        alt={language === 'ar' ? item.name_ar : item.name_en}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-brand-dark text-sm line-clamp-2">
                          {language === 'ar' ? item.name_ar : item.name_en}
                        </h4>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-brand-gray hover:text-red-500 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <p className="text-brand-orange font-bold text-sm mt-1">{t('egp')} {item.price.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-brand-gray/30 rounded-lg overflow-hidden">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 bg-brand-light text-brand-dark hover:bg-brand-gray/20 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-3 py-1 text-sm font-medium text-brand-dark min-w-[2rem] text-center">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 bg-brand-light text-brand-dark hover:bg-brand-gray/20 transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-brand-gray/20 bg-brand-light/30">
            <div className="flex items-center justify-between mb-4">
              <span className="text-brand-gray font-medium">Subtotal</span>
              <span className="font-bold text-brand-dark text-lg">{t('egp')} {cartTotal.toLocaleString()}</span>
            </div>
            <p className="text-xs text-brand-gray mb-6">Taxes and shipping calculated at checkout</p>
            <Link 
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="w-full bg-brand-dark text-brand-light hover:bg-brand-orange hover:text-brand-dark transition-colors py-4 rounded-xl font-bold flex items-center justify-center gap-2 group"
            >
              Proceed to Checkout
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform rtl:rotate-180" />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
