'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { submitMaintenanceRequest } from '@/lib/actions/maintenance';
import { MaintenanceRequest } from '@/types';
import { Wrench, CheckCircle2, AlertCircle, ArrowRight, Smartphone, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { PhoneInput } from '@/components/ui/PhoneInput';

const BRANDS = ['Apple', 'Samsung', 'Huawei', 'Xiaomi', 'Other'];

export default function MaintenanceForm() {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successRequest, setSuccessRequest] = useState<MaintenanceRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    customer_name: user?.user_metadata?.full_name || '',
    customer_phone: '',
    customer_email: user?.email || '',
    device_brand: 'Apple',
    device_type: '',
    issue_description: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.issue_description.length < 20) {
      setError('Issue description must be at least 20 characters');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await submitMaintenanceRequest({
        ...formData,
        user_id: user?.id
      });

      if (result.success && result.request) {
        setSuccessRequest(result.request);
      } else {
        setError(result.error || 'Failed to submit request');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successRequest) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-[2.5rem] shadow-2xl shadow-brand-dark/5 p-8 md:p-12 text-center border border-brand-gray/10">
        <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-3xl font-display font-bold text-brand-dark mb-4">Request Submitted!</h2>
        <p className="text-brand-gray mb-10 text-lg">
          Your maintenance request has been received. Please save your request number for tracking.
        </p>
        
        <div className="bg-brand-light/50 rounded-3xl p-8 mb-10 border border-brand-gray/10">
          <p className="text-sm font-bold text-brand-dark/40 uppercase tracking-widest mb-2">Request Number</p>
          <p className="text-5xl font-display font-black text-brand-orange tracking-tighter">
            {successRequest.request_number}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link 
            href={`/track?type=maintenance&ref=${successRequest.request_number}`}
            className="flex items-center justify-center gap-2 py-4 bg-brand-dark text-white rounded-2xl font-bold hover:bg-brand-orange hover:text-brand-dark transition-all group"
          >
            Track Request
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link 
            href="/"
            className="flex items-center justify-center gap-2 py-4 border border-brand-gray/20 text-brand-dark rounded-2xl font-bold hover:bg-brand-light transition-all"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col lg:flex-row bg-white rounded-[2.5rem] shadow-2xl shadow-brand-dark/5 overflow-hidden border border-brand-gray/10">
      {/* Sidebar Info */}
      <div className="lg:w-1/3 bg-brand-dark p-8 md:p-12 text-white flex flex-col justify-between">
        <div>
          <div className="w-16 h-16 bg-brand-orange rounded-2xl flex items-center justify-center text-brand-dark mb-8">
            <Wrench size={32} />
          </div>
          <h2 className="text-3xl font-display font-bold mb-6">Repair Your Device</h2>
          <p className="text-brand-gray leading-relaxed mb-8">
            Fast, professional repair services for your mobile devices. Submit your request now and we'll get back to you with an estimate.
          </p>
          
          <ul className="space-y-6">
            <li className="flex items-start gap-4">
              <div className="mt-1 text-brand-orange"><Smartphone size={20} /></div>
              <div>
                <p className="font-bold text-sm">All Brands</p>
                <p className="text-xs text-brand-gray">Apple, Samsung, Xiaomi & more</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <div className="mt-1 text-brand-orange"><ShieldCheck size={20} /></div>
              <div>
                <p className="font-bold text-sm">Warranty</p>
                <p className="text-xs text-brand-gray">Quality parts & service guarantee</p>
              </div>
            </li>
          </ul>
        </div>
        
        <div className="mt-12 pt-8 border-t border-brand-gray/20">
          <p className="text-xs text-brand-gray">Need immediate help?</p>
          <p className="text-lg font-bold text-brand-orange">+20 123 456 7890</p>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 p-8 md:p-12">
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700 text-sm">
            <AlertCircle size={20} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-dark/60 uppercase tracking-wider ms-1">Full Name *</label>
              <input 
                type="text" 
                name="customer_name"
                required
                value={formData.customer_name}
                onChange={handleChange}
                placeholder="Ahmed Mohamed"
                className="w-full bg-brand-light/30 border border-brand-gray/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-orange outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-dark/60 uppercase tracking-wider ms-1">Phone Number *</label>
              <PhoneInput
                required
                value={formData.customer_phone}
                onChange={(customer_phone) =>
                  setFormData(prev => ({ ...prev, customer_phone }))
                }
                placeholder="1012345678"
                className="bg-brand-light/30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-brand-dark/60 uppercase tracking-wider ms-1">Email Address</label>
            <input 
              type="email" 
              name="customer_email"
              value={formData.customer_email}
              onChange={handleChange}
              placeholder="ahmed@example.com"
              className="w-full bg-brand-light/30 border border-brand-gray/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-orange outline-none transition-all"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-dark/60 uppercase tracking-wider ms-1">Device Brand *</label>
              <select 
                name="device_brand"
                value={formData.device_brand}
                onChange={handleChange}
                className="w-full bg-brand-light/30 border border-brand-gray/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-orange outline-none transition-all appearance-none"
              >
                {BRANDS.map(brand => <option key={brand} value={brand}>{brand}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-brand-dark/60 uppercase tracking-wider ms-1">Model Name *</label>
              <input 
                type="text" 
                name="device_type"
                required
                value={formData.device_type}
                onChange={handleChange}
                placeholder="iPhone 13 Pro Max"
                className="w-full bg-brand-light/30 border border-brand-gray/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-orange outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ms-1">
              <label className="text-sm font-bold text-brand-dark/60 uppercase tracking-wider">Issue Description *</label>
              <span className={`text-[10px] font-bold ${formData.issue_description.length < 20 ? 'text-brand-gray' : 'text-green-500'}`}>
                {formData.issue_description.length} / 20 chars min
              </span>
            </div>
            <textarea 
              name="issue_description"
              required
              rows={4}
              value={formData.issue_description}
              onChange={handleChange}
              placeholder="Please describe the issue in detail..."
              className="w-full bg-brand-light/30 border border-brand-gray/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-brand-orange outline-none transition-all resize-none"
            />
          </div>

          <button 
            type="submit"
            disabled={isSubmitting || formData.issue_description.length < 20}
            className="w-full py-5 bg-brand-dark text-white rounded-2xl font-black uppercase tracking-widest hover:bg-brand-orange hover:text-brand-dark transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-brand-dark/10"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  );
}
