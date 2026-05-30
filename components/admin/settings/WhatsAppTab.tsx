'use client';

import { useState } from 'react';
import { Save, Loader2, Play, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { SettingsMap } from '@/types';
import { testWhatsAppConnection } from '@/lib/actions/settings';

interface WhatsAppTabProps {
  settings: Record<string, string | null>;
  onSave: (fields: { key: keyof SettingsMap; value: string }[]) => Promise<void>;
  isSaving: boolean;
}

export default function WhatsAppTab({ settings, onSave, isSaving }: WhatsAppTabProps) {
  const [formData, setFormData] = useState({
    whatsapp_phone_number_id: settings.whatsapp_phone_number_id || '',
    whatsapp_access_token: settings.whatsapp_access_token || '',
    whatsapp_business_name: settings.whatsapp_business_name || '',
    whatsapp_notify_orders: settings.whatsapp_notify_orders || 'false',
    whatsapp_notify_maintenance: settings.whatsapp_notify_maintenance || 'false',
    whatsapp_notify_credentials: settings.whatsapp_notify_credentials || 'false',
    whatsapp_notify_status_update: settings.whatsapp_notify_status_update || 'false',
    whatsapp_template_order: settings.whatsapp_template_order || '',
    whatsapp_template_maintenance: settings.whatsapp_template_maintenance || '',
    whatsapp_template_status: settings.whatsapp_template_status || '',
    whatsapp_template_credentials: settings.whatsapp_template_credentials || '',
    whatsapp_template_language: settings.whatsapp_template_language || 'ar',
  });

  const [showToken, setShowToken] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleTestConnection = async () => {
    if (!testPhone) {
      alert('Please enter a phone number to test (with country code)');
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testWhatsAppConnection(testPhone);
      setTestResult({
        success: result.success,
        message: result.success ? 'Test message sent successfully!' : result.error || 'Failed to send test message',
      });
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
          <div className="w-2 h-6 bg-green-500 rounded-full" />
          API Connection
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500">Phone Number ID</label>
            <input
              type="text"
              value={formData.whatsapp_phone_number_id}
              onChange={e => setFormData({ ...formData, whatsapp_phone_number_id: e.target.value })}
              placeholder="e.g. 104829374928"
              className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500">Access Token</label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={formData.whatsapp_access_token}
                onChange={e => setFormData({ ...formData, whatsapp_access_token: e.target.value })}
                placeholder="EAA..."
                className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
              >
                {showToken ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500">Business Name</label>
            <input
              type="text"
              value={formData.whatsapp_business_name}
              onChange={e => setFormData({ ...formData, whatsapp_business_name: e.target.value })}
              placeholder="Jacob Store"
              className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Test Connection */}
        <div className="p-6 bg-green-50 rounded-3xl border border-green-100 space-y-4">
          <p className="text-sm font-bold text-green-800">Test Connection</p>
          <div className="flex gap-4">
            <input
              type="text"
              value={testPhone}
              onChange={e => setTestPhone(e.target.value)}
              placeholder="+201012345678"
              className="flex-1 px-5 py-2.5 bg-white border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none text-sm"
            />
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-green-200 transition-all disabled:opacity-50"
            >
              {isTesting ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
              Send Test
            </button>
          </div>
          {testResult && (
            <div className={`flex items-center gap-2 text-sm font-bold ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
              {testResult.success ? <CheckCircle size={16} /> : <XCircle size={16} />}
              {testResult.message}
            </div>
          )}
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Templates Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
          <div className="w-2 h-6 bg-indigo-500 rounded-full" />
          Template Names
        </h3>
        <p className="text-xs text-gray-500">Must match names approved in your Meta WhatsApp dashboard.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500">Order Confirmation</label>
            <input
              type="text"
              value={formData.whatsapp_template_order}
              onChange={e => setFormData({ ...formData, whatsapp_template_order: e.target.value })}
              placeholder="e.g. order_confirm"
              className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500">Maintenance Received</label>
            <input
              type="text"
              value={formData.whatsapp_template_maintenance}
              onChange={e => setFormData({ ...formData, whatsapp_template_maintenance: e.target.value })}
              placeholder="e.g. repair_intake"
              className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500">Status Update</label>
            <input
              type="text"
              value={formData.whatsapp_template_status}
              onChange={e => setFormData({ ...formData, whatsapp_template_status: e.target.value })}
              className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500">Account Credentials</label>
            <input
              type="text"
              value={formData.whatsapp_template_credentials}
              onChange={e => setFormData({ ...formData, whatsapp_template_credentials: e.target.value })}
              className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500">Language Code</label>
            <select
              value={formData.whatsapp_template_language}
              onChange={e => setFormData({ ...formData, whatsapp_template_language: e.target.value })}
              className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="ar">Arabic (ar)</option>
              <option value="en_US">English (en_US)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* Notifications Section */}
      <div className="space-y-6">
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
          <div className="w-2 h-6 bg-orange-500 rounded-full" />
          Send Notifications
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-white hover:border-orange-500 transition-all group">
            <input
              type="checkbox"
              checked={formData.whatsapp_notify_orders === 'true'}
              onChange={e => setFormData({ ...formData, whatsapp_notify_orders: e.target.checked ? 'true' : 'false' })}
              className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm font-bold text-gray-700">Order Placed</span>
          </label>
          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-white hover:border-orange-500 transition-all group">
            <input
              type="checkbox"
              checked={formData.whatsapp_notify_maintenance === 'true'}
              onChange={e => setFormData({ ...formData, whatsapp_notify_maintenance: e.target.checked ? 'true' : 'false' })}
              className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm font-bold text-gray-700">Maintenance Request Received</span>
          </label>
          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-white hover:border-orange-500 transition-all group">
            <input
              type="checkbox"
              checked={formData.whatsapp_notify_status_update === 'true'}
              onChange={e => setFormData({ ...formData, whatsapp_notify_status_update: e.target.checked ? 'true' : 'false' })}
              className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm font-bold text-gray-700">Maintenance Status Update</span>
          </label>
          <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-white hover:border-orange-500 transition-all group">
            <input
              type="checkbox"
              checked={formData.whatsapp_notify_credentials === 'true'}
              onChange={e => setFormData({ ...formData, whatsapp_notify_credentials: e.target.checked ? 'true' : 'false' })}
              className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm font-bold text-gray-700">New Account Credentials</span>
          </label>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100 flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-10 py-3 rounded-2xl font-bold shadow-lg shadow-green-100 transition-all disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          Save WhatsApp Settings
        </button>
      </div>
    </form>
  );
}
