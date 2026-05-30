'use client';

import React, { useState } from 'react';
import { MaintenanceRequest, MaintenanceStatus } from '@/types';
import { 
  Wrench, 
  CheckCircle2, 
  Copy, 
  ArrowRight,
  Loader2,
  Smartphone,
  Info,
  DollarSign,
  User,
  ClipboardList
} from 'lucide-react';
import CustomerLookupField from '../shared/CustomerLookupField';
import { createMaintenanceOnBehalf } from '@/lib/actions/maintenance';
import Link from 'next/link';

export default function CreateMaintenanceForm() {
  const [customer, setCustomer] = useState<{ full_name: string; phone: string; email?: string; exists: boolean } | null>(null);
  const [formData, setFormData] = useState({
    device_brand: '',
    device_type: '',
    issue_description: '',
    estimated_cost: '',
    assigned_to: '',
    admin_notes: '',
    initial_status: 'PENDING' as MaintenanceStatus
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ request: MaintenanceRequest; tempPassword?: string; newAccount: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) {
      setError('Please confirm customer details first');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await createMaintenanceOnBehalf({
        customer_full_name: customer.full_name,
        customer_phone: customer.phone,
        customer_email: customer.email,
        device_brand: formData.device_brand,
        device_type: formData.device_type,
        issue_description: formData.issue_description,
        estimated_cost: formData.estimated_cost ? Number(formData.estimated_cost) : undefined,
        assigned_to: formData.assigned_to || undefined,
        admin_notes: formData.admin_notes || undefined,
        initial_status: formData.initial_status
      });

      if (result.success && result.request) {
        setSuccessData({
          request: result.request,
          tempPassword: result.temporaryPassword,
          newAccount: result.newAccountCreated || false
        });
      } else {
        setError(result.error || 'Failed to create maintenance request');
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
        <div className="bg-white rounded-[40px] shadow-2xl border border-orange-100 overflow-hidden">
          <div className="bg-orange-500 p-8 text-center text-slate-900">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-3xl font-black mb-2">Request Created!</h2>
            <p className="opacity-90 font-medium text-sm">Request Number: {successData.request.request_number}</p>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 bg-gray-50 rounded-3xl">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                <p className="font-black text-gray-900">{successData.request.customer_name}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Device</p>
                <p className="font-black text-gray-900">{successData.request.device_brand} {successData.request.device_type}</p>
              </div>
            </div>

            {successData.newAccount && successData.tempPassword && (
              <div className="bg-blue-50 border-2 border-blue-100 rounded-[32px] p-8 space-y-4">
                <div className="flex items-center gap-3 text-blue-800">
                  <User size={24} className="text-blue-500" />
                  <h3 className="text-lg font-black">New Account Created</h3>
                </div>
                <p className="text-sm text-blue-700 leading-relaxed font-medium">
                  A temporary account was created for this customer.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div className="bg-white p-4 rounded-2xl border border-blue-200">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Email</p>
                    <p className="text-sm font-bold text-gray-900">{successData.request.customer_email}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-blue-200 relative">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Password</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-gray-900">{successData.tempPassword}</p>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(successData.tempPassword!);
                        }}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-blue-500 transition-colors"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                </div>
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
                href={`/admin/maintenance`}
                className="flex-1 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all text-center flex items-center justify-center gap-2"
              >
                View All Requests
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      
      {/* Section 1: Customer */}
      <section className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
            <User size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">Customer Details</h3>
            <p className="text-sm text-gray-500">Who is bringing the device?</p>
          </div>
        </div>
        <div className="p-8">
          <CustomerLookupField onResolved={setCustomer} />
        </div>
      </section>

      {/* Section 2: Device */}
      <section className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
            <Smartphone size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">Device & Issue</h3>
            <p className="text-sm text-gray-500">Describe the problem with the device.</p>
          </div>
        </div>
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Device Brand*</label>
              <input
                type="text"
                required
                placeholder="e.g. Apple, Samsung, Huawei"
                value={formData.device_brand}
                onChange={(e) => setFormData({ ...formData, device_brand: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Device Model*</label>
              <input
                type="text"
                required
                placeholder="e.g. iPhone 13 Pro Max"
                value={formData.device_type}
                onChange={(e) => setFormData({ ...formData, device_type: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Issue Description*</label>
            <textarea
              required
              rows={4}
              placeholder="Explain the problem in detail..."
              value={formData.issue_description}
              onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all min-h-[120px]"
            />
          </div>
        </div>
      </section>

      {/* Section 3: Staff Only */}
      <section className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden border-l-4 border-l-purple-500">
        <div className="p-8 border-b border-gray-50 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
            <ClipboardList size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">Staff Details</h3>
            <p className="text-sm text-gray-500">Internal management fields (not public).</p>
          </div>
        </div>
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 px-1 flex items-center gap-2">
                <Info size={14} className="text-gray-400" />
                Initial Status
              </label>
              <select
                value={formData.initial_status}
                onChange={(e) => setFormData({ ...formData, initial_status: e.target.value as MaintenanceStatus })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-bold"
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="WAITING_PARTS">Waiting Parts</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 px-1 flex items-center gap-2">
                <DollarSign size={14} className="text-gray-400" />
                Estimated Cost
              </label>
              <input
                type="number"
                placeholder="EGP 0.00"
                value={formData.estimated_cost}
                onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Assign To</label>
              <input
                type="text"
                placeholder="Staff name"
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 px-1">Admin Notes (Internal)</label>
            <textarea
              rows={3}
              placeholder="Internal technical notes or details..."
              value={formData.admin_notes}
              onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>
        </div>
      </section>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-2xl flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !customer}
        className={`w-full py-5 rounded-[24px] font-black text-xl flex items-center justify-center gap-3 transition-all ${
          isSubmitting || !customer
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-orange-500 text-slate-900 hover:bg-orange-600 shadow-xl shadow-orange-500/20'
        }`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" size={24} />
            Creating...
          </>
        ) : (
          <>
            Create Maintenance Request
            <ArrowRight size={24} />
          </>
        )}
      </button>
      
      {!customer && !isSubmitting && (
        <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
          Confirm customer details to enable button
        </p>
      )}

    </form>
  );
}
