'use client';

import { useState, useEffect } from 'react';
import { MaintenanceRequest, MaintenanceStatus } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { createClient } from '@/lib/supabase/client';
import { Wrench, Clock, CheckCircle2, AlertCircle, Smartphone, DollarSign, User, Info, FileText } from 'lucide-react';

interface MaintenanceTrackerProps {
  request: MaintenanceRequest;
}

export default function MaintenanceTracker({ request: initialRequest }: MaintenanceTrackerProps) {
  const [request, setRequest] = useState(initialRequest);
  const { t, language } = useLanguage();
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`maintenance-${request.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'maintenance_requests', 
        filter: `id=eq.${request.id}` 
      }, (payload) => {
        setRequest(prev => ({ ...prev, ...payload.new }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [request.id, supabase]);

  const steps: { id: MaintenanceStatus; label: string; icon: any }[] = [
    { id: 'PENDING', label: 'Pending', icon: Clock },
    { id: 'REVIEWED', label: 'Reviewed', icon: Info },
    { id: 'IN_PROGRESS', label: 'Repairing', icon: Wrench },
    { id: 'WAITING_PARTS', label: 'Waiting Parts', icon: Clock },
    { id: 'DONE', label: 'Completed', icon: CheckCircle2 }
  ];

  if (request.status === 'CANCELLED') {
    steps.push({ id: 'CANCELLED', label: 'Cancelled', icon: AlertCircle });
  }

  const currentStepIndex = steps.findIndex(s => s.id === request.status);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-brand-dark text-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-brand-dark/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-display font-black tracking-tight mb-2">{request.request_number}</h1>
            <p className="text-brand-gray">Submitted on {new Date(request.submitted_at || '').toLocaleDateString()}</p>
          </div>
          <div className={`px-6 py-2 rounded-full font-bold text-sm ${
            request.payment_status === 'PAID' ? 'bg-green-500/20 text-green-400' : 'bg-brand-orange/20 text-brand-orange'
          }`}>
            Payment: {request.payment_status}
          </div>
        </div>

        {/* Stepper */}
        <div className="mt-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-white/10 -translate-y-1/2 rounded-full" />
          <div 
            className={`absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full transition-all duration-1000 ${request.status === 'CANCELLED' ? 'bg-red-500' : 'bg-brand-orange'}`}
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          />
          
          <div className="relative flex justify-between items-center">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = idx <= currentStepIndex;
              const isActive = idx === currentStepIndex;
              const isCancelled = step.id === 'CANCELLED';
              
              return (
                <div key={step.id} className="flex flex-col items-center gap-3">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                    isCompleted 
                      ? (isCancelled ? 'bg-red-500 text-white' : 'bg-brand-orange text-brand-dark shadow-[0_0_20px_rgba(255,159,10,0.4)]') 
                      : 'bg-brand-light/10 text-brand-gray'
                  } ${isActive ? 'scale-125 z-10' : ''}`}>
                    <Icon size={20} />
                  </div>
                  <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider transition-colors ${
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
        {/* Device & Issue */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-brand-gray/10 shadow-sm">
            <h3 className="text-xl font-display font-bold text-brand-dark mb-8 flex items-center gap-3">
              <Smartphone className="text-brand-orange" size={24} />
              Device Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-xs font-bold text-brand-gray uppercase tracking-widest mb-1">Brand</p>
                <p className="text-lg font-bold text-brand-dark">{request.device_brand}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-brand-gray uppercase tracking-widest mb-1">Model / Type</p>
                <p className="text-lg font-bold text-brand-dark">{request.device_type}</p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-brand-gray/5">
              <p className="text-xs font-bold text-brand-gray uppercase tracking-widest mb-3">Issue Description</p>
              <div className="bg-brand-light/30 rounded-2xl p-6">
                <p className="text-brand-dark font-medium italic leading-relaxed">"{request.issue_description}"</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-brand-gray/10 shadow-sm">
            <h3 className="text-xl font-display font-bold text-brand-dark mb-8 flex items-center gap-3">
              <FileText className="text-brand-orange" size={24} />
              Updates & Notes
            </h3>
            <div className="space-y-6">
              {request.customer_notes ? (
                <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100">
                  <p className="text-indigo-900 font-medium leading-relaxed">{request.customer_notes}</p>
                </div>
              ) : (
                <p className="text-brand-gray italic">No updates have been posted yet. Check back soon!</p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 border border-brand-gray/10 shadow-sm">
            <h3 className="text-lg font-display font-bold text-brand-dark mb-6 flex items-center gap-3">
              <DollarSign className="text-brand-orange" size={20} />
              Pricing
            </h3>
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold text-brand-gray uppercase tracking-widest mb-1">Estimated Cost</p>
                <p className="text-xl font-black text-brand-dark">
                  {request.estimated_cost ? `${t('egp')} ${request.estimated_cost.toLocaleString()}` : 'Pending Review'}
                </p>
              </div>
              {request.status === 'DONE' && (
                <div className="pt-6 border-t border-brand-gray/5">
                  <p className="text-xs font-bold text-brand-gray uppercase tracking-widest mb-1">Final Cost</p>
                  <p className="text-2xl font-black text-brand-orange">
                    {t('egp')} {(request.actual_cost || request.estimated_cost || 0).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-brand-dark text-white rounded-[2.5rem] p-8 shadow-xl shadow-brand-dark/10">
            <h3 className="text-lg font-display font-bold mb-6 flex items-center gap-3 text-brand-orange">
              <User size={20} />
              Repair Team
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-1">Assigned Technician</p>
                <p className="font-bold">{request.assigned_to || 'Assigning soon...'}</p>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-[10px] font-bold text-brand-gray uppercase tracking-widest mb-1">Last Update</p>
                <p className="text-sm">{new Date(request.updated_at || '').toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
