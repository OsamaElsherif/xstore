'use client';

import { useState } from 'react';
import { Save, Loader2, Play, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { SettingsMap } from '@/types';
// import { testMetaConnection } from '@/lib/actions/settings';

interface MetaAdsTabProps {
  settings: Record<string, string | null>;
  onSave: (fields: { key: keyof SettingsMap; value: string }[]) => Promise<void>;
  isSaving: boolean;
}

export default function MetaAdsTab({ settings, onSave, isSaving }: MetaAdsTabProps) {
  const [formData, setFormData] = useState({
    meta_access_token: settings.meta_access_token || '',
    meta_ad_account_id: settings.meta_ad_account_id || '',
    meta_pixel_id: settings.meta_pixel_id || '',
    meta_page_id: settings.meta_page_id || '',
    meta_app_id: settings.meta_app_id || '',
  });

  const [showToken, setShowToken] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      // TODO: implement test connection
      setTestResult({ success: false, message: 'Not implemented yet' });
    } catch (err: any) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(Object.entries(formData).map(([key, value]) => ({
      key: key as keyof SettingsMap,
      value: value as string
    })));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {/* Connection Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
          <div className="w-2 h-6 bg-blue-500 rounded-full" />
          Meta API Connection
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-sm font-bold text-gray-500">Access Token (Long-lived User Token)</label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={formData.meta_access_token}
                onChange={e => setFormData({ ...formData, meta_access_token: e.target.value })}
                placeholder="EAA..."
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
              >
                {showToken ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500">Ad Account ID</label>
            <input
              type="text"
              value={formData.meta_ad_account_id}
              onChange={e => setFormData({ ...formData, meta_ad_account_id: e.target.value })}
              placeholder="act_XXXXXXXXX"
              className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500">Facebook Page ID</label>
            <input
              type="text"
              value={formData.meta_page_id}
              onChange={e => setFormData({ ...formData, meta_page_id: e.target.value })}
              className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500">Meta App ID</label>
            <input
              type="text"
              value={formData.meta_app_id}
              onChange={e => setFormData({ ...formData, meta_app_id: e.target.value })}
              className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Test Connection */}
        <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100 space-y-4">
          <p className="text-sm font-bold text-blue-800">Verify Credentials</p>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-blue-200 transition-all disabled:opacity-50"
          >
            {isTesting ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
            Test Connection
          </button>
          {testResult && (
            <div className={`flex items-center gap-2 text-sm font-bold ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
              {testResult.success ? <CheckCircle size={16} /> : <XCircle size={16} />}
              {testResult.message}
            </div>
          )}
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Pixel Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
          <div className="w-2 h-6 bg-pink-500 rounded-full" />
          Meta Pixel
        </h3>
        <div className="space-y-2">
          <label className="text-sm font-bold text-gray-500">Pixel ID (Conversion Tracking)</label>
          <input
            type="text"
            value={formData.meta_pixel_id}
            onChange={e => setFormData({ ...formData, meta_pixel_id: e.target.value })}
            placeholder="e.g. 104829374928"
            className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-pink-500 outline-none transition-all"
          />
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1 ps-2">
            {formData.meta_pixel_id ? 'Pixel active on site' : 'No pixel configured'}
          </p>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100 flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-10 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Save Meta Settings
        </button>
      </div>
    </form>
  );
}
