'use client';

import { useState, useEffect } from 'react';
import { Order, OrderItem } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { createClient } from '@/lib/supabase/client';
import { Package, Clock, CheckCircle2, MapPin, Calendar, FileText } from 'lucide-react';

interface OrderTrackerProps {
  order: Order & { order_items: OrderItem[] };
}

export default function OrderTracker({ order: initialOrder }: OrderTrackerProps) {
  const [order, setOrder] = useState(initialOrder);
  const { t, language } = useLanguage();
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`order-${order.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'orders', 
        filter: `id=eq.${order.id}` 
      }, (payload) => {
        setOrder(prev => ({ ...prev, ...payload.new }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order.id, supabase]);

  const steps = [
    { id: 'NOT_DONE', label: t('statusNOT_DONE'), icon: <Clock size={20} /> },
    { id: 'UNDER_REPAIR', label: t('statusUNDER_REPAIR'), icon: <Package size={20} /> },
    { id: 'DONE', label: t('statusDONE'), icon: <CheckCircle2 size={20} /> }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === order.status);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-brand-dark text-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-brand-dark/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-display font-black tracking-tight mb-2">Order {order.order_number}</h1>
            <p className="text-brand-gray">Placed on {new Date(order.order_date || '').toLocaleDateString()}</p>
          </div>
          <div className={`px-6 py-2 rounded-full font-bold text-sm ${
            order.payment_status === 'PAID' ? 'bg-green-500/20 text-green-400' : 'bg-brand-orange/20 text-brand-orange'
          }`}>
            Payment: {order.payment_status}
          </div>
        </div>

        {/* Stepper */}
        <div className="mt-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 rounded-full" />
          <div 
            className="absolute top-1/2 left-0 h-1 bg-brand-orange -translate-y-1/2 rounded-full transition-all duration-1000"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          />
          
          <div className="relative flex justify-between items-center">
            {steps.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isActive = idx === currentStepIndex;
              
              return (
                <div key={step.id} className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isCompleted ? 'bg-brand-orange text-brand-dark shadow-[0_0_20px_rgba(255,159,10,0.4)]' : 'bg-brand-light/10 text-brand-gray'
                  } ${isActive ? 'scale-125 z-10' : ''}`}>
                    {step.icon}
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                    isCompleted ? 'text-white' : 'text-brand-gray'
                  }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 md:p-10 border border-brand-gray/10 shadow-sm">
          <h3 className="text-xl font-display font-bold text-brand-dark mb-8 flex items-center gap-3">
            <Package className="text-brand-orange" size={24} />
            Order Items
          </h3>
          <div className="space-y-6">
            {order.order_items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center pb-6 border-b border-brand-gray/5 last:border-0 last:pb-0">
                <div>
                  <p className="font-bold text-brand-dark">{item.snapshot_name}</p>
                  <p className="text-sm text-brand-gray">Quantity: {item.quantity}</p>
                </div>
                <p className="font-black text-brand-dark">{t('egp')} {(item.snapshot_price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
            <div className="pt-6 mt-6 border-t-2 border-brand-dark flex justify-between items-center">
              <span className="text-lg font-display font-bold text-brand-dark">Total Amount</span>
              <span className="text-3xl font-display font-black text-brand-orange">{t('egp')} {order.total_price.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Shipping & Notes */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 border border-brand-gray/10 shadow-sm">
            <h3 className="text-lg font-display font-bold text-brand-dark mb-6 flex items-center gap-3">
              <MapPin className="text-brand-orange" size={20} />
              Delivery Info
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold text-brand-gray uppercase tracking-widest mb-1">Shipping Address</p>
                <p className="text-sm text-brand-dark font-medium leading-relaxed">{order.shipping_address}, {order.city}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-brand-gray uppercase tracking-widest mb-1 flex items-center gap-1">
                  <Calendar size={12} /> Estimated Delivery
                </p>
                <p className="text-sm text-brand-dark font-medium">{order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'TBD'}</p>
              </div>
            </div>
          </div>

          <div className="bg-brand-light/30 rounded-[2.5rem] p-8 border border-brand-gray/10">
            <h3 className="text-lg font-display font-bold text-brand-dark mb-6 flex items-center gap-3">
              <FileText className="text-brand-orange" size={20} />
              Order Notes
            </h3>
            <p className="text-sm text-brand-gray italic leading-relaxed">
              {order.notes || 'No special instructions provided for this order.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
