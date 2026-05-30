'use client';

import { useState } from 'react';
import { Store, MessageSquare, BarChart3, Save, Loader2, CheckCircle2 } from 'lucide-react';
import StoreInfoTab from './StoreInfoTab';
import WhatsAppTab from './WhatsAppTab';
import MetaAdsTab from './MetaAdsTab';
import { saveSettings } from '@/lib/actions/settings';
import { SettingsMap } from '@/types';

interface AppSettingsProps {
  initialSettings: Record<string, string | null>;
}

export default function AppSettings({ initialSettings }: AppSettingsProps) {
  const [activeTab, setActiveTab] = useState<'store' | 'whatsapp' | 'meta'>('store');
  const [settings, setSettings] = useState(initialSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (updatedFields: { key: keyof SettingsMap; value: string }[]) => {
    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const result = await saveSettings(updatedFields);
      if (result.success) {
        setSaveSuccess(true);
        // Update local state
        const newSettings = { ...settings };
        updatedFields.forEach(f => {
          newSettings[f.key] = f.value;
        });
        setSettings(newSettings);
        
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setError(result.error || 'Failed to save settings');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tabs Header */}
      <div className="bg-white p-1 rounded-2xl border border-gray-200 shadow-sm flex gap-1">
        <button
          onClick={() => setActiveTab('store')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'store' 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' 
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Store size={18} />
          Store Info
        </button>
        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'whatsapp' 
              ? 'bg-green-600 text-white shadow-lg shadow-green-200' 
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <MessageSquare size={18} />
          WhatsApp
        </button>
        <button
          onClick={() => setActiveTab('meta')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'meta' 
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <BarChart3 size={18} />
          Meta & Ads
        </button>
      </div>

      {/* Save Status Overlay */}
      {saveSuccess && (
        <div className="fixed bottom-10 right-10 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white border-2 border-green-500 text-green-600 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 font-bold">
            <CheckCircle2 size={24} />
            Settings saved successfully!
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Tab Content */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
        <div className="p-8">
          {activeTab === 'store' && (
            <StoreInfoTab 
              settings={settings} 
              onSave={handleSave} 
              isSaving={isSaving} 
            />
          )}
          {activeTab === 'whatsapp' && (
            <WhatsAppTab 
              settings={settings} 
              onSave={handleSave} 
              isSaving={isSaving} 
            />
          )}
          {activeTab === 'meta' && (
            <MetaAdsTab 
              settings={settings} 
              onSave={handleSave} 
              isSaving={isSaving} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
