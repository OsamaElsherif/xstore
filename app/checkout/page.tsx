'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ShoppingBag, AlertCircle, Minus, Plus, X } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useCart } from '@/contexts/CartContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { createOrder } from '@/lib/actions/orders';
import { useRouter } from 'next/navigation';
import { getProductImageUrl } from '@/lib/supabase/storage';
import { PhoneInput } from '@/components/ui/PhoneInput';

export default function Checkout() {
  const { items, cartTotal, clearCart, updateQuantity, removeFromCart } = useCart();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
  });
  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhoneChange = (phone: string) => {
    setFormData((prev) => ({ ...prev, phone }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || isSubmitting) return;

    setIsSubmitting(true);
    setErrors([]);

    try {
      const result = await createOrder({
        customer_name: `${formData.firstName} ${formData.lastName}`,
        customer_phone: formData.phone,
        customer_email: formData.email,
        shipping_address: formData.address,
        city: formData.city,
        total_price: cartTotal,
        user_id: user?.id,
        items: items.map(item => ({
          product_id: item.id,
          snapshot_name: language === 'ar' ? item.name_ar : item.name_en,
          snapshot_price: item.price,
          quantity: item.quantity
        }))
      });

      if (result.success && result.order) {
        clearCart();
        router.push(`/checkout/success?order=${result.order.order_number}`);
      } else if (result.errors) {
        setErrors(result.errors);
      }
    } catch (error) {
      console.error('Failed to place order:', error);
      setErrors(['An unexpected error occurred. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen flex flex-col bg-brand-light/30">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-brand-gray/10">
            <div className="w-20 h-20 bg-brand-light text-brand-gray rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag size={40} />
            </div>
            <h1 className="text-2xl font-display font-bold text-brand-dark mb-4">Your Cart is Empty</h1>
            <p className="text-brand-gray mb-8">
              Looks like you haven&apos;t added any items to your cart yet.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center justify-center w-full py-3 bg-brand-dark text-white rounded-xl font-medium hover:bg-brand-orange hover:text-brand-dark transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-brand-light/30">
      <Navbar />
      
      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
        <Link href="/" className="inline-flex items-center gap-2 text-brand-gray hover:text-brand-dark transition-colors mb-8 font-medium">
          <ArrowLeft size={18} />
          Back to Shopping
        </Link>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Checkout Form */}
          <div className="flex-1">
            {errors.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
                <h3 className="text-red-800 font-bold mb-2 flex items-center gap-2">
                  <AlertCircle size={18} />
                  Please correct the following errors:
                </h3>
                <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                  {errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-brand-gray/20">
              <h2 className="text-2xl font-display font-bold text-brand-dark mb-6">Shipping Information</h2>
              
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="w-full bg-brand-light/20 border border-brand-gray/20 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="w-full bg-brand-light/20 border border-brand-gray/20 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full bg-brand-light/20 border border-brand-gray/20 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">Phone Number</label>
                    <PhoneInput
                      required
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      className="bg-brand-light/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-brand-dark mb-2">Street Address</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full bg-brand-light/20 border border-brand-gray/20 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full bg-brand-light/20 border border-brand-gray/20 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-brand-orange focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white rounded-2xl shadow-sm p-8 border border-brand-gray/20 sticky top-24">
              <h2 className="text-xl font-display font-bold text-brand-dark mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-brand-light border border-brand-gray/20 flex-shrink-0">
                      {item.image_url && (
                        <Image
                          src={getProductImageUrl(item.image_url) || ''}
                          alt={language === 'ar' ? item.name_ar : item.name_en}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-bold text-brand-dark text-sm line-clamp-2">
                          {language === 'ar' ? item.name_ar : item.name_en}
                        </h4>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-brand-gray hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-brand-gray/30 rounded-lg overflow-hidden bg-brand-light/50">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-1.5 py-0.5 hover:bg-brand-gray/20 transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-2 py-0.5 text-xs font-medium text-brand-dark min-w-[1.5rem] text-center">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-1.5 py-0.5 hover:bg-brand-gray/20 transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="font-bold text-brand-dark text-sm whitespace-nowrap">
                      {t('egp')} {(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-brand-gray/20 pt-4 space-y-3 mb-6">
                <div className="flex justify-between text-brand-gray">
                  <span>Subtotal</span>
                  <span className="font-medium text-brand-dark">EGP {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-brand-gray">
                  <span>Shipping</span>
                  <span className="font-medium text-brand-dark">Free</span>
                </div>
                <div className="flex justify-between text-brand-gray">
                  <span>Taxes</span>
                  <span className="font-medium text-brand-dark">Calculated at next step</span>
                </div>
                <div className="flex justify-between border-t border-brand-gray/20 pt-3 mt-3">
                  <span className="font-bold text-brand-dark text-lg">Total</span>
                  <span className="font-bold text-brand-orange text-xl">EGP {cartTotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full bg-brand-dark text-brand-light hover:bg-brand-orange hover:text-brand-dark transition-colors py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
