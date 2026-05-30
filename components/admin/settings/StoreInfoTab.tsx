'use client';

import { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { SettingsMap } from '@/types';

interface StoreInfoTabProps {
  settings: Record<string, string | null>;
  onSave: (fields: { key: keyof SettingsMap; value: string }[]) => Promise<void>;
  isSaving: boolean;
}

export default function StoreInfoTab({ settings, onSave, isSaving }: StoreInfoTabProps) {
  const [formData, setFormData] = useState({
    store_name: settings.store_name || '',
    store_phone: settings.store_phone || '',
    store_email: settings.store_email || '',
    store_address: settings.store_address || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave([
      { key: 'store_name', value: formData.store_name },
      { key: 'store_phone', value: formData.store_phone },
      { key: 'store_email', value: formData.store_email },
      { key: 'store_address', value: formData.store_address },
    ]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Store Name*</label>
          <input
            type="text"
            required
            value={formData.store_name}
            onChange={e => setFormData({ ...formData, store_name: e.target.value })}
            placeholder="e.g. Jacob Store Egypt"
            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Store Phone</label>
          <input
            type="text"
            value={formData.store_phone}
            onChange={e => setFormData({ ...formData, store_phone: e.target.value })}
            placeholder="+20 100 000 0000"
            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Store Email</label>
          <input
            type="email"
            value={formData.store_email}
            onChange={e => setFormData({ ...formData, store_email: e.target.value })}
            placeholder="contact@jacoup.com"
            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Store Address</label>
          <input
            type="text"
            value={formData.store_address}
            onChange={e => setFormData({ ...formData, store_address: e.target.value })}
            placeholder="Cairo, Egypt"
            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100 flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Save Store Info
        </button>
      </div>
    </form>
  );
}
