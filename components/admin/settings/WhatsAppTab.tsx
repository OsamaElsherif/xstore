'use client';

import { useState } from 'react';
import { Save, Loader2, Eye, EyeOff } from 'lucide-react';
import { SettingsMap } from '@/types';
import QRConnection from '@/components/admin/whatsapp/QRConnection';

interface WhatsAppTabProps {
  settings: Record<string, string | null>;
  onSave: (fields: { key: keyof SettingsMap; value: string }[]) => Promise<void>;
  isSaving: boolean;
}

export default function WhatsAppTab({ settings, onSave, isSaving }: WhatsAppTabProps) {
  const [instanceId, setInstanceId] = useState(settings.greenapi_instance_id || '');
  const [apiToken, setApiToken] = useState(settings.greenapi_api_token || '');
  const [showToken, setShowToken] = useState(false);

  // These track the SAVED values — passed to QRConnection so it only
  // tries to connect once the user has actually saved their credentials.
  const [savedInstanceId, setSavedInstanceId] = useState(settings.greenapi_instance_id || '');
  const [savedApiToken, setSavedApiToken] = useState(settings.greenapi_api_token || '');

  const [connectionSuccess, setConnectionSuccess] = useState(false);

  const [notifySettings, setNotifySettings] = useState({
    whatsapp_notify_orders: settings.whatsapp_notify_orders || 'false',
    whatsapp_notify_maintenance: settings.whatsapp_notify_maintenance || 'false',
    whatsapp_notify_status_update: settings.whatsapp_notify_status_update || 'false',
    whatsapp_notify_credentials: settings.whatsapp_notify_credentials || 'false',
  });

  const handleSaveCredentials = async () => {
    await onSave([
      { key: 'greenapi_instance_id', value: instanceId },
      { key: 'greenapi_api_token', value: apiToken },
    ]);
    // Only update saved values after successful save so QRConnection re-checks
    setSavedInstanceId(instanceId);
    setSavedApiToken(apiToken);
  };

  return (
    <div className="space-y-10">

      {/* ── Section 1: Credentials ─────────────────────────────────────────── */}
      <div className="space-y-6">
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
          <div className="w-2 h-6 bg-green-500 rounded-full" />
          Green API Credentials
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500">Instance ID</label>
            <input
              type="text"
              value={instanceId}
              onChange={e => setInstanceId(e.target.value)}
              placeholder="e.g. 1101234567"
              className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-500">API Token</label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={apiToken}
                onChange={e => setApiToken(e.target.value)}
                placeholder="d75b3a66374942c5b3c6b…"
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
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveCredentials}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-green-100 transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save Credentials
          </button>
        </div>
      </div>

      <div className="h-px bg-gray-100" />

      {/* ── Section 2: Connection Status + QR ─────────────────────────────── */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
          <div className="w-2 h-6 bg-indigo-500 rounded-full" />
          Connection Status
        </h3>
        {connectionSuccess && (
          <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
            ✅ WhatsApp connected successfully!
          </div>
        )}
        <QRConnection
          instanceId={savedInstanceId}
          apiToken={savedApiToken}
          onConnected={() => setConnectionSuccess(true)}
        />
      </div>

      <div className="h-px bg-gray-100" />

      {/* ── Section 3: Notification Toggles ───────────────────────────────── */}
      <div className="space-y-6">
        <h3 className="text-lg font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
          <div className="w-2 h-6 bg-orange-500 rounded-full" />
          Send via WhatsApp
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'whatsapp_notify_orders' as keyof typeof notifySettings, label: 'Order placed' },
            { key: 'whatsapp_notify_maintenance' as keyof typeof notifySettings, label: 'Maintenance request received' },
            { key: 'whatsapp_notify_status_update' as keyof typeof notifySettings, label: 'Maintenance status update' },
            { key: 'whatsapp_notify_credentials' as keyof typeof notifySettings, label: 'New account credentials (staff-created)' },
          ].map(({ key, label }) => (
            <label
              key={key}
              className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-white hover:border-orange-400 transition-all"
            >
              <input
                type="checkbox"
                checked={notifySettings[key] === 'true'}
                onChange={e => setNotifySettings({ ...notifySettings, [key]: e.target.checked ? 'true' : 'false' })}
                className="w-5 h-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-sm font-bold text-gray-700">{label}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => onSave(
              Object.entries(notifySettings).map(([key, value]) => ({
                key: key as keyof SettingsMap,
                value,
              }))
            )}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-orange-100 transition-all disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save Notification Settings
          </button>
        </div>
      </div>
    </div>
  );
}
