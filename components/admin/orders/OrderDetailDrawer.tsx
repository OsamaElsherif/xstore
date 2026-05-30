'use client';

import { useState, useEffect } from 'react';
import { X, User, Phone, Mail, MapPin, Package, Calendar, FileText, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { OrderWithItems, OrderStatus, PaymentStatus, UserRole, Order } from '@/types';
import { updateOrderStatus, updatePaymentStatus, updateDeliveryDate, updateOrderNotes } from '@/lib/actions/orders';
import { useLanguage } from '@/contexts/LanguageContext';

interface OrderDetailDrawerProps {
  order: OrderWithItems | null;
  onClose: () => void;
  role: UserRole;
  onUpdated: (updatedOrder: Partial<Order>) => void;
}

export default function OrderDetailDrawer({ order, onClose, role, onUpdated }: OrderDetailDrawerProps) {
  const [status, setStatus] = useState<OrderStatus>('NOT_DONE');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('UNPAID');
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSaving, setIsSubmitting] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (order) {
      setStatus(order.status || 'NOT_DONE');
      setPaymentStatus(order.payment_status || 'UNPAID');
      setDeliveryDate(order.delivery_date || '');
      setNotes(order.notes || '');
    }
  }, [order]);

  if (!order) return null;

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      const updates: Partial<Order> = {};

      if (status !== order.status) {
        await updateOrderStatus(order.id, status);
        updates.status = status;
      }

      if (paymentStatus !== order.payment_status) {
        await updatePaymentStatus(order.id, paymentStatus);
        updates.payment_status = paymentStatus;
      }

      if (role === 'ADMIN' && deliveryDate !== order.delivery_date) {
        await updateDeliveryDate(order.id, deliveryDate || null);
        updates.delivery_date = deliveryDate || null;
      }

      if (notes !== order.notes) {
        await updateOrderNotes(order.id, notes);
        updates.notes = notes;
      }

      onUpdated(updates);
      onClose();
    } catch (err) {
      alert('Failed to save changes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAdmin = role === 'ADMIN';
  const isCashier = role === 'CASHIER';
  const isOrderReceiver = role === 'ORDER_RECEIVER';

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white z-[70] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Order {order.order_number}</h2>
            <p className="text-sm text-gray-500">{new Date(order.order_date || '').toLocaleDateString('en-GB')}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Customer Info */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Customer Details</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3 text-gray-700">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><User size={16} /></div>
                <span className="font-medium">{order.customer_name}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><Phone size={16} /></div>
                <span>{order.customer_phone}</span>
              </div>
              {order.customer_email && (
                <div className="flex items-center gap-3 text-gray-700">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center"><Mail size={16} /></div>
                  <span>{order.customer_email}</span>
                </div>
              )}
              <div className="flex items-start gap-3 text-gray-700">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5"><MapPin size={16} /></div>
                <span>{order.shipping_address}, {order.city}</span>
              </div>
            </div>
          </section>

          {/* Items */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Order Items</h3>
            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
              {order.order_items.map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">
                      {item.quantity}x
                    </div>
                    <span className="font-medium text-gray-800">{item.snapshot_name}</span>
                  </div>
                  <span className="font-bold text-gray-600">{t('egp')} {(item.snapshot_price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-gray-200 flex justify-between items-center font-bold text-lg text-gray-800">
                <span>Total</span>
                <span className="text-indigo-600">{t('egp')} {order.total_price.toLocaleString()}</span>
              </div>
            </div>
          </section>

          {/* Management */}
          <section className="space-y-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Management</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(isAdmin || isOrderReceiver) && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as OrderStatus)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="NOT_DONE">{t('statusNOT_DONE')}</option>
                    <option value="UNDER_REPAIR">{t('statusUNDER_REPAIR')}</option>
                    <option value="DONE">{t('statusDONE')}</option>
                  </select>
                </div>
              )}

              {(isAdmin || isCashier) && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">Payment</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="PAID">{t('paymentPAID')}</option>
                    <option value="UNPAID">{t('paymentUNPAID')}</option>
                  </select>
                </div>
              )}
            </div>

            {isAdmin && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 flex items-center gap-2">
                  <Calendar size={14} /> Delivery Date
                </label>
                <input
                  type="date"
                  value={deliveryDate.split('T')[0]}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            )}

            {(isAdmin || isOrderReceiver) && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 flex items-center gap-2">
                  <FileText size={14} /> Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Internal notes about the order..."
                />
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={isSaving}
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}

function RefreshCw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}
