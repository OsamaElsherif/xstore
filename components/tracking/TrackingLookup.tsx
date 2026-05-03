'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, Wrench, ArrowRight } from 'lucide-react';

interface TrackingLookupProps {
  initialType?: 'order' | 'maintenance';
}

export default function TrackingLookup({ initialType = 'order' }: TrackingLookupProps) {
  const [type, setType] = useState<'order' | 'maintenance'>(initialType);
  const [ref, setRef] = useState('');
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (ref.trim()) {
      router.push(`/track?type=${type}&ref=${encodeURIComponent(ref.trim())}`);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-brand-dark/5 p-8 md:p-12 border border-brand-gray/10">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-brand-dark mb-4">Track Your Order or Repair</h1>
        <p className="text-brand-gray">Enter your reference number below to get real-time status updates.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8 max-w-lg mx-auto">
        {/* Type Selector */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => setType('order')}
            className={`flex items-center justify-center gap-3 p-4 rounded-2xl font-bold transition-all ${
              type === 'order' 
                ? 'bg-brand-dark text-white shadow-xl shadow-brand-dark/10' 
                : 'bg-brand-light/50 text-brand-gray hover:bg-brand-light'
            }`}
          >
            <Package size={20} />
            Order
          </button>
          <button
            type="button"
            onClick={() => setType('maintenance')}
            className={`flex items-center justify-center gap-3 p-4 rounded-2xl font-bold transition-all ${
              type === 'maintenance' 
                ? 'bg-brand-dark text-white shadow-xl shadow-brand-dark/10' 
                : 'bg-brand-light/50 text-brand-gray hover:bg-brand-light'
            }`}
          >
            <Wrench size={20} />
            Repair
          </button>
        </div>

        {/* Reference Input */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-brand-dark/60 uppercase tracking-wider ms-1">
            Reference Number
          </label>
          <div className="relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-brand-gray" size={20} />
            <input
              type="text"
              required
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              placeholder={type === 'order' ? 'e.g. #1042' : 'e.g. MR-1001'}
              className="w-full bg-brand-light/30 border border-brand-gray/10 rounded-2xl ps-14 pe-6 py-5 focus:ring-2 focus:ring-brand-orange outline-none transition-all text-lg font-medium"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-5 bg-brand-orange text-brand-dark rounded-2xl font-black uppercase tracking-widest hover:bg-brand-dark hover:text-white transition-all group flex items-center justify-center gap-3 shadow-xl shadow-brand-orange/10"
        >
          Track Now
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </form>
    </div>
  );
}
