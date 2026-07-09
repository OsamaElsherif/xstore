'use client';

import React, { useState, useMemo } from 'react';
import { Product, Category, Order } from '@/types';
import {
  Plus,
  Minus,
  Trash2,
  Search,
  Package,
  CheckCircle2,
  Copy,
  ArrowRight,
  ShoppingCart,
  CreditCard,
  StickyNote,
  Loader2,
  User
} from 'lucide-react';
import CustomerLookupField from '../shared/CustomerLookupField';
import { createOrderOnBehalf } from '@/lib/actions/orders';
import Link from 'next/link';

interface StaffCartItem {
  product_id: string;
  snapshot_name: string;
  snapshot_price: number;
  quantity: number;
  stock_quantity: number;
}

interface CreateOrderFormProps {
  products: (Product & { category_name_en: string | null })[];
  categories: Category[];
}

export default function CreateOrderForm({ products, categories }: CreateOrderFormProps) {
  const [customer, setCustomer] = useState<{ full_name: string; phone: string; email?: string; exists: boolean } | null>(null);
  const [cartItems, setCartItems] = useState<StaffCartItem[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'UNPAID'>('UNPAID');
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ order: Order; tempPassword?: string; newAccount: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.name_ar.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.category_id === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const addToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        if (existing.quantity >= (product.stock_quantity ?? 0) && !product.is_service) return prev;
        return prev.map(item => item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, {
        product_id: product.id,
        snapshot_name: product.name_en,
        snapshot_price: product.price,
        quantity: 1,
        stock_quantity: product.stock_quantity ?? 0
      }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.product_id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        if (newQty > item.stock_quantity && item.stock_quantity > 0) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.product_id !== id));
  };

  const total = cartItems.reduce((sum, item) => sum + (item.snapshot_price * item.quantity), 0);

  const handleSubmit = async () => {
    if (!customer) {
      setError('Please confirm customer details first');
      return;
    }
    if (cartItems.length === 0) {
      setError('Please add at least one product');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createOrderOnBehalf({
        customer_full_name: customer.full_name,
        customer_phone: customer.phone,
        customer_email: customer.email,
        items: cartItems.map(item => ({
          product_id: item.product_id,
          snapshot_name: item.snapshot_name,
          snapshot_price: item.snapshot_price,
          quantity: item.quantity
        })),
        total_price: total,
        payment_status: paymentStatus,
        notes
      });

      if (result.success && result.order) {
        setSuccessData({
          order: result.order,
          tempPassword: result.temporaryPassword,
          newAccount: result.newAccountCreated || false
        });
      } else {
        setError(result.errors?.join(', ') || 'Failed to create order');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="max-w-2xl mx-auto py-12 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white rounded-[40px] shadow-2xl border border-green-100 overflow-hidden">
          <div className="bg-green-500 p-8 text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-black mb-2">Order Created!</h2>
            <p className="opacity-90 font-medium">Order Number: {successData.order.order_number}</p>
          </div>

          <div className="p-8 space-y-8">
            <div className="flex justify-between items-center p-6 bg-gray-50 rounded-3xl">
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                <p className="font-black text-gray-900">{successData.order.customer_name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Paid</p>
                <p className="font-black text-orange-600 text-xl">EGP {successData.order.total_price.toLocaleString()}</p>
              </div>
            </div>

            {successData.newAccount && successData.tempPassword && (
              <div className="bg-blue-50 border-2 border-blue-100 rounded-[32px] p-8 space-y-4">
                <div className="flex items-center gap-3 text-blue-800">
                  <Package size={24} className="text-blue-500" />
                  <h3 className="text-lg font-black">New Account Created</h3>
                </div>
                <p className="text-sm text-blue-700 leading-relaxed font-medium">
                  A temporary account was created for this customer so they can track their order and view history.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div className="bg-white p-4 rounded-2xl border border-blue-200">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Email</p>
                    <p className="text-sm font-bold text-gray-900">{successData.order.customer_email}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-blue-200 relative group">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Password</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-gray-900">{successData.tempPassword}</p>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(successData.tempPassword!);
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-blue-500 transition-colors"
                        title="Copy Password"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-blue-400 text-center font-bold uppercase tracking-widest pt-2">
                  ⚠️ Share these credentials with the customer
                </p>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-4 bg-gray-100 text-gray-900 font-bold rounded-2xl hover:bg-gray-200 transition-all"
              >
                Create Another
              </button>
              <Link
                href={`/admin/orders`}
                className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all text-center flex items-center justify-center gap-2"
              >
                View All Orders
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column - Forms */}
        <div className="lg:col-span-2 space-y-8">

          {/* Section 1: Customer */}
          <section className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
                <User size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Customer Details</h3>
                <p className="text-sm text-gray-500">Identify the customer for this order.</p>
              </div>
            </div>
            <div className="p-8">
              <CustomerLookupField onResolved={setCustomer} />
            </div>
          </section>

          {/* Section 2: Products */}
          <section className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">Add Products</h3>
                  <p className="text-sm text-gray-500">Pick products from the catalog.</p>
                </div>
              </div>
            </div>
            <div className="p-8 space-y-6">
              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by product name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-bold"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name_en}</option>
                  ))}
                </select>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-1 custom-scrollbar">
                {filteredProducts.map(product => {
                  const outOfStock = !product.is_service && (product.stock_quantity ?? 0) <= 0;
                  return (
                    <div key={product.id} className="group p-4 bg-gray-50 hover:bg-white border border-transparent hover:border-orange-200 rounded-2xl transition-all flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-black text-gray-900 truncate">{product.name_en}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-xs font-bold text-orange-600">EGP {product.price.toLocaleString()}</p>
                          <span className="text-[10px] text-gray-400">•</span>
                          <p className={`text-[10px] font-bold ${outOfStock ? 'text-red-500' : 'text-gray-400'}`}>
                            {product.is_service ? 'Service' : `Stock: ${product.stock_quantity}`}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => addToCart(product)}
                        disabled={outOfStock}
                        className="p-2 bg-white text-orange-600 rounded-xl border border-orange-100 hover:bg-orange-600 hover:text-white transition-all shadow-sm disabled:opacity-50 disabled:grayscale"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Section 3: Details */}
          <section className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
                <StickyNote size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-gray-900">Payment & Notes</h3>
                <p className="text-sm text-gray-500">Additional information for this order.</p>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 px-1">Payment Status</label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setPaymentStatus('PAID')}
                    className={`flex-1 py-3 px-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-bold ${paymentStatus === 'PAID' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-100 text-gray-500'
                      }`}
                  >
                    <CheckCircle2 size={20} />
                    Paid
                  </button>
                  <button
                    onClick={() => setPaymentStatus('UNPAID')}
                    className={`flex-1 py-3 px-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-3 font-bold ${paymentStatus === 'UNPAID' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-white border-gray-100 text-gray-500'
                      }`}
                  >
                    <CreditCard size={20} />
                    Unpaid
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Order Notes (Internal)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific instructions or details..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all min-h-[100px] text-sm"
                />
              </div>
            </div>
          </section>
        </div>

        {/* Right Column - Cart Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="bg-slate-900 text-white rounded-[40px] shadow-xl overflow-hidden p-8">
              <div className="flex items-center gap-3 mb-8">
                <ShoppingCart size={24} className="text-orange-500" />
                <h3 className="text-xl font-black">Order Summary</h3>
              </div>

              <div className="space-y-6 mb-12 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {cartItems.length > 0 ? (
                  cartItems.map(item => (
                    <div key={item.product_id} className="group">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-sm font-bold truncate">{item.snapshot_name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                            EGP {item.snapshot_price.toLocaleString()}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.product_id)}
                          className="text-slate-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between bg-slate-800/50 rounded-xl p-2 px-3">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.product_id, -1)}
                            className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center hover:bg-slate-600 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-black w-6 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product_id, 1)}
                            className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center hover:bg-slate-600 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <p className="text-sm font-black text-orange-500">
                          EGP {(item.snapshot_price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 text-center opacity-30">
                    <Package size={48} className="mx-auto mb-4" />
                    <p className="text-sm font-bold">No items added yet</p>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-800">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-widest">Subtotal</span>
                  <span className="text-sm font-bold">EGP {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-widest">Discount</span>
                  <span className="text-sm font-bold">EGP 0</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-lg font-black">Total</span>
                  <span className="text-2xl font-black text-orange-500">EGP {total.toLocaleString()}</span>
                </div>
              </div>

              {error && (
                <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-2xl flex items-center gap-2 animate-shake">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  {error}
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !customer || cartItems.length === 0}
                className={`w-full py-5 rounded-3xl font-black text-lg mt-8 flex items-center justify-center gap-3 transition-all ${isSubmitting || !customer || cartItems.length === 0
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-orange-500 text-slate-900 hover:bg-orange-400 shadow-xl shadow-orange-500/20 active:scale-95'
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    Creating Order...
                  </>
                ) : (
                  <>
                    Create Order
                    <ArrowRight size={24} />
                  </>
                )}
              </button>

              {!customer && !isSubmitting && (
                <p className="text-[10px] text-slate-500 font-bold text-center mt-4 uppercase tracking-widest">
                  Confirm customer details to enable
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
