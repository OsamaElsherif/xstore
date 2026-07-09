'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Check, CreditCard, Package, Calendar, FileText, Printer, ChevronRight, Loader2 } from 'lucide-react';
import { OrderWithItems, OrderStatus, PaymentStatus, UserRole, Order } from '@/types';
import { updateOrderStatus, updatePaymentStatus } from '@/lib/actions/orders';
import { useLanguage } from '@/contexts/LanguageContext';

interface OrderActionsMenuProps {
  order: OrderWithItems;
  role: UserRole;
  onUpdated: (updatedOrder: Partial<Order>) => void;
}

export default function OrderActionsMenu({ order, role, onUpdated }: OrderActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<'status' | 'payment' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStatusUpdate = async (status: OrderStatus) => {
    setIsLoading(true);
    const result = await updateOrderStatus(order.id, status);
    if (result.success) {
      onUpdated({ status });
      setIsOpen(false);
    } else {
      alert(result.error);
    }
    setIsLoading(false);
  };

  const handlePaymentUpdate = async (paymentStatus: PaymentStatus) => {
    setIsLoading(true);
    const result = await updatePaymentStatus(order.id, paymentStatus);
    if (result.success) {
      onUpdated({ payment_status: paymentStatus });
      setIsOpen(false);
    } else {
      alert(result.error);
    }
    setIsLoading(false);
  };

  const isAdmin = role === 'ADMIN';
  const isCashier = role === 'CASHIER';
  const isOrderReceiver = role === 'ORDER_RECEIVER';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
        disabled={isLoading}
      >
        {isLoading ? <Loader2 size={20} className="animate-spin" /> : <MoreVertical size={20} />}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 py-2 overflow-visible">
          {/* Status Submenu */}
          {(isAdmin || isOrderReceiver) && (
            <div className="relative group">
              <button
                onMouseEnter={() => setActiveSubmenu('status')}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Package size={16} />
                  <span>Update Status</span>
                </div>
                <ChevronRight size={14} />
              </button>
              
              {activeSubmenu === 'status' && (
                <div 
                  className="absolute left-full top-0 ml-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2"
                  onMouseLeave={() => setActiveSubmenu(null)}
                >
                  {(['NOT_DONE', 'UNDER_REPAIR', 'DONE'] as OrderStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(status)}
                      className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      <span>{t(`status${status}` as any)}</span>
                      {order.status === status && <Check size={14} className="text-indigo-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Payment Submenu */}
          {(isAdmin || isCashier) && (
            <div className="relative group">
              <button
                onMouseEnter={() => setActiveSubmenu('payment')}
                className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CreditCard size={16} />
                  <span>Update Payment</span>
                </div>
                <ChevronRight size={14} />
              </button>

              {activeSubmenu === 'payment' && (
                <div 
                  className="absolute left-full top-0 ml-1 w-40 bg-white rounded-xl shadow-xl border border-gray-100 py-2"
                  onMouseLeave={() => setActiveSubmenu(null)}
                >
                  {(['PAID', 'UNPAID'] as PaymentStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => handlePaymentUpdate(status)}
                      className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      <span>{t(`payment${status}` as any)}</span>
                      {order.payment_status === status && <Check size={14} className="text-indigo-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {isAdmin && (
            <>
              <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                <Calendar size={16} />
                <span>Set Delivery Date</span>
              </button>
              <div className="my-1 border-t border-gray-100"></div>
            </>
          )}

          {(isAdmin || isOrderReceiver) && (
            <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
              <FileText size={16} />
              <span>Edit Notes</span>
            </button>
          )}

          <button 
            onClick={() => window.print()}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          >
            <Printer size={16} />
            <span>Print Order</span>
          </button>
        </div>
      )}
    </div>
  );
}
