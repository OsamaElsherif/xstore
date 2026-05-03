'use client';

import { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Smartphone, Wrench, FileText, DollarSign, Save, Loader2, Info } from 'lucide-react';
import { MaintenanceRequest, MaintenanceStatus, UserRole } from '@/types';
import { updateMaintenanceStatus, updateMaintenanceCost, updateMaintenanceDetails, updateMaintenancePayment } from '@/lib/actions/maintenance';
import { useLanguage } from '@/contexts/LanguageContext';

interface MaintenanceDetailDrawerProps {
  request: MaintenanceRequest | null;
  onClose: () => void;
  role: UserRole;
  onUpdated: (updates: Partial<MaintenanceRequest>) => void;
}

export default function MaintenanceDetailDrawer({ request, onClose, role, onUpdated }: MaintenanceDetailDrawerProps) {
  const [status, setStatus] = useState<MaintenanceStatus>('PENDING');
  const [paymentStatus, setPaymentStatus] = useState<'PAID' | 'UNPAID'>('UNPAID');
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [actualCost, setActualCost] = useState<number>(0);
  const [assignedTo, setAssignedTo] = useState<string>('');
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (request) {
      setStatus(request.status as MaintenanceStatus);
      setPaymentStatus((request.payment_status as 'PAID' | 'UNPAID') || 'UNPAID');
      setEstimatedCost(request.estimated_cost || 0);
      setActualCost(request.actual_cost || 0);
      setAssignedTo(request.assigned_to || '');
      setCustomerNotes(request.customer_notes || '');
      setAdminNotes(request.admin_notes || '');
    }
  }, [request]);

  if (!request) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates: Partial<MaintenanceRequest> = {};
      
      if (status !== request.status) {
        await updateMaintenanceStatus(request.id, status);
        updates.status = status;
      }
      
      if (paymentStatus !== request.payment_status) {
        await updateMaintenancePayment(request.id, paymentStatus);
        updates.payment_status = paymentStatus;
      }

      if (role === 'ADMIN' && (estimatedCost !== request.estimated_cost || actualCost !== request.actual_cost)) {
        await updateMaintenanceCost(request.id, { 
          estimated_cost: estimatedCost, 
          actual_cost: actualCost 
        });
        updates.estimated_cost = estimatedCost;
        updates.actual_cost = actualCost;
      }

      if (assignedTo !== request.assigned_to || customerNotes !== request.customer_notes || adminNotes !== request.admin_notes) {
        const detailsUpdate: any = { assigned_to: assignedTo, customer_notes: customerNotes };
        if (role !== 'CASHIER') detailsUpdate.admin_notes = adminNotes;
        
        await updateMaintenanceDetails(request.id, detailsUpdate);
        updates.assigned_to = assignedTo;
        updates.customer_notes = customerNotes;
        if (role !== 'CASHIER') updates.admin_notes = adminNotes;
      }

      onUpdated(updates);
      onClose();
    } catch (err) {
      alert('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const isAdmin = role === 'ADMIN';
  const isCashier = role === 'CASHIER';
  const isOrderReceiver = role === 'ORDER_RECEIVER';

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-lg bg-white z-[70] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{request.request_number}</h2>
            <p className="text-sm text-gray-500">Submitted on {new Date(request.submitted_at || '').toLocaleDateString()}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Customer */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3 text-gray-700">
                <User size={18} className="text-indigo-500" />
                <span className="font-medium">{request.customer_name}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Phone size={18} className="text-indigo-500" />
                <span>{request.customer_phone}</span>
              </div>
              {request.customer_email && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Mail size={18} className="text-indigo-500" />
                  <span>{request.customer_email}</span>
                </div>
              )}
            </div>
          </section>

          {/* Device & Issue */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Device & Issue</h3>
            <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <Smartphone size={18} className="text-indigo-500" />
                <span className="font-bold">{request.device_brand} — {request.device_type}</span>
              </div>
              <div className="flex items-start gap-3">
                <Info size={18} className="text-indigo-500 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600 italic leading-relaxed">"{request.issue_description}"</p>
              </div>
            </div>
          </section>

          {/* Management */}
          <section className="space-y-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Management</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {(isAdmin || isOrderReceiver) && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">Status</label>
                  <select 
                    value={status}
                    onChange={(e) => setStatus(e.target.value as MaintenanceStatus)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="REVIEWED">Reviewed</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="WAITING_PARTS">Waiting Parts</option>
                    <option value="DONE">Done</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              )}
              {(isAdmin || isCashier) && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500">Payment</label>
                  <select 
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="PAID">Paid</option>
                    <option value="UNPAID">Unpaid</option>
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {isAdmin && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">Estimated Cost (EGP)</label>
                    <input 
                      type="number"
                      value={estimatedCost}
                      onChange={(e) => setEstimatedCost(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500">Actual Cost (EGP)</label>
                    <input 
                      type="number"
                      value={actualCost}
                      onChange={(e) => setActualCost(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </>
              )}
            </div>

            {(isAdmin || isOrderReceiver) && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">Assigned To</label>
                <input 
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Technician Name"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500">Customer Notes (Visible to Customer)</label>
              <textarea 
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                placeholder="Notes for the customer to see..."
              />
            </div>

            {role !== 'CASHIER' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500">Admin Notes (Internal Only)</label>
                <textarea 
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Private notes for staff..."
                />
              </div>
            )}
          </section>
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 px-6 py-3 border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button 
            disabled={isSaving}
            onClick={handleSave}
            className="flex-1 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
}
