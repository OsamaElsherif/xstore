'use client';

import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Check, CreditCard, Package, DollarSign, User, FileText, ChevronRight, Loader2, Wrench, Eye } from 'lucide-react';
import { MaintenanceRequest, MaintenanceStatus, UserRole } from '@/types';
import { updateMaintenanceStatus, updateMaintenancePayment } from '@/lib/actions/maintenance';
import { useLanguage } from '@/contexts/LanguageContext';

interface MaintenanceActionsMenuProps {
  request: MaintenanceRequest;
  role: UserRole;
  onUpdated: (updates: Partial<MaintenanceRequest>) => void;
}

export default function MaintenanceActionsMenu({ request, role, onUpdated }: MaintenanceActionsMenuProps) {
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

  const handleStatusUpdate = async (status: MaintenanceStatus) => {
    setIsLoading(true);
    const result = await updateMaintenanceStatus(request.id, status);
    if (result.success) {
      onUpdated({ status });
      setIsOpen(false);
    } else {
      alert(result.error);
    }
    setIsLoading(false);
  };

  const handlePaymentUpdate = async (paymentStatus: 'PAID' | 'UNPAID') => {
    setIsLoading(true);
    const result = await updateMaintenancePayment(request.id, paymentStatus);
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
                  <Wrench size={16} />
                  <span>Update Status</span>
                </div>
                <ChevronRight size={14} />
              </button>
              
              {activeSubmenu === 'status' && (
                <div 
                  className="absolute left-full top-0 ml-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2"
                  onMouseLeave={() => setActiveSubmenu(null)}
                >
                  {(['PENDING', 'REVIEWED', 'IN_PROGRESS', 'WAITING_PARTS', 'DONE', 'CANCELLED'] as MaintenanceStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(status)}
                      className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      <span>{status.replace('_', ' ')}</span>
                      {request.status === status && <Check size={14} className="text-indigo-600" />}
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
                  {(['PAID', 'UNPAID'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => handlePaymentUpdate(status)}
                      className="w-full flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                    >
                      <span>{status}</span>
                      {request.payment_status === status && <Check size={14} className="text-indigo-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="my-1 border-t border-gray-100"></div>

          <button 
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            onClick={() => {/* Open detail drawer logic is handled by parent dashboard */}}
          >
            <Eye size={16} />
            <span>View Details</span>
          </button>
        </div>
      )}
    </div>
  );
}
