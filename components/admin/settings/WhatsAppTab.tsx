'use client';

import { useState, useEffect, useRef } from 'react';
import { Save, Loader2, Lock, Send, RefreshCw, LogOut, Smartphone, WifiOff } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { SettingsMap } from '@/types';
import {
  saveSettings,
  createWasenderSession,
  connectWasenderSession,
  getWasenderQR,
  getWasenderStatus,
  disconnectWasenderSession,
  testWasenderConnection,
} from '@/lib/actions/settings';

// ─── Types ───────────────────────────────────────────────────────────────────

type TabScreen = 'token_entry' | 'session_setup' | 'connecting' | 'connected';
type ConnectTab = 'qr' | 'phone';

interface WhatsAppTabProps {
  settings: Record<string, string | null>;
  onSave: (fields: { key: keyof SettingsMap; value: string }[]) => Promise<void>;
  isSaving: boolean;
}

// QR auto-refresh: expires every 45s, refresh at 44s
const QR_EXPIRY_MS = 44_000;
// Status poll interval while connecting
const STATUS_POLL_MS = 5_000;

// ─── Component ───────────────────────────────────────────────────────────────

export default function WhatsAppTab({ settings, onSave, isSaving }: WhatsAppTabProps) {
  // ── Screen state ────────────────────────────────────────────────────────────
  const [screen, setScreen] = useState<TabScreen>('token_entry');

  // ── Screen 1: Token entry ───────────────────────────────────────────────────
  const [tokenInput, setTokenInput] = useState('');
  const [isSavingToken, setIsSavingToken] = useState(false);

  // ── Screen 2: Session setup ─────────────────────────────────────────────────
  const [sessionName, setSessionName] = useState('Jacob Store WhatsApp');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  // ── Screen 3: Connecting ────────────────────────────────────────────────────
  const [connectTab, setConnectTab] = useState<ConnectTab>('qr');
  const [qrString, setQrString] = useState<string | null>(null);
  const [isLoadingQR, setIsLoadingQR] = useState(false);
  const qrTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statusTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Screen 4: Connected ─────────────────────────────────────────────────────
  const [testPhone, setTestPhone] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [notifySettings, setNotifySettings] = useState({
    whatsapp_notify_orders: settings.whatsapp_notify_orders ?? 'false',
    whatsapp_notify_maintenance: settings.whatsapp_notify_maintenance ?? 'false',
    whatsapp_notify_status_update: settings.whatsapp_notify_status_update ?? 'false',
    whatsapp_notify_credentials: settings.whatsapp_notify_credentials ?? 'false',
  });

  // ── Shared error ────────────────────────────────────────────────────────────
  const [error, setError] = useState<string | null>(null);

  // Cached personal token (masked, read-only after first save)
  const savedToken = settings.wasender_personal_access_token ?? '';

  // ── Interval cleanup ────────────────────────────────────────────────────────
  const clearTimers = () => {
    if (qrTimerRef.current) { clearInterval(qrTimerRef.current); qrTimerRef.current = null; }
    if (statusTimerRef.current) { clearInterval(statusTimerRef.current); statusTimerRef.current = null; }
  };

  // ── Check live status (used on mount when session exists) ───────────────────
  const checkStatus = async () => {
    const result = await getWasenderStatus();
    if (result.status === 'connected') {
      setScreen('connected');
    } else {
      setScreen('connecting');
      // Try to connect + get initial QR
      const conn = await connectWasenderSession();
      if (conn.success && conn.qrString) setQrString(conn.qrString);
    }
  };

  // ── Derive initial screen on mount ──────────────────────────────────────────
  useEffect(() => {
    if (!settings.wasender_personal_access_token) {
      setScreen('token_entry');
    } else if (!settings.wasender_session_id) {
      setScreen('session_setup');
    } else {
      checkStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Polling while on connecting screen ──────────────────────────────────────
  useEffect(() => {
    if (screen !== 'connecting') {
      clearTimers();
      return;
    }

    // Poll status every 5s to detect successful scan
    statusTimerRef.current = setInterval(async () => {
      const result = await getWasenderStatus();
      if (result.status === 'connected') {
        clearTimers();
        setScreen('connected');
      }
    }, STATUS_POLL_MS);

    // Refresh QR every 44s (just before 45s expiry)
    qrTimerRef.current = setInterval(async () => {
      const result = await getWasenderQR();
      if (result.qrString) setQrString(result.qrString);
    }, QR_EXPIRY_MS);

    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleSaveToken = async () => {
    if (!tokenInput.trim()) return;
    setIsSavingToken(true);
    setError(null);
    const result = await saveSettings([
      { key: 'wasender_personal_access_token', value: tokenInput.trim() },
    ]);
    setIsSavingToken(false);
    if (result.success) {
      // Reflect in local settings snapshot so read-only display shows masked value
      settings.wasender_personal_access_token = tokenInput.trim();
      setScreen('session_setup');
    } else {
      setError(result.error ?? 'Failed to save token');
    }
  };

  const handleCreateSession = async () => {
    if (!sessionName.trim() || !phoneNumber.trim()) return;
    setIsCreatingSession(true);
    setError(null);

    // Step 1: Create session (auto-saves session_id + api_key)
    const createResult = await createWasenderSession({
      sessionName: sessionName.trim(),
      phoneNumber: phoneNumber.trim(),
    });

    if (!createResult.success) {
      setError(createResult.error ?? 'Failed to create session');
      setIsCreatingSession(false);
      return;
    }

    // Step 2: Connect and get initial QR
    const conn = await connectWasenderSession();
    if (conn.success && conn.qrString) setQrString(conn.qrString);

    setIsCreatingSession(false);
    setScreen('connecting');
  };

  const handleRefreshQR = async () => {
    setIsLoadingQR(true);
    const result = await getWasenderQR();
    if (result.qrString) setQrString(result.qrString);
    setIsLoadingQR(false);
  };

  const handleDisconnect = async () => {
    if (!window.confirm('Disconnect WhatsApp? Messages will stop until reconnected.')) return;
    clearTimers();
    await disconnectWasenderSession();
    // Session still exists — just go back to connecting (rescan)
    setQrString(null);
    const conn = await connectWasenderSession();
    if (conn.success && conn.qrString) setQrString(conn.qrString);
    setScreen('connecting');
  };

  const handleTestMessage = async () => {
    if (!testPhone.trim()) return;
    setIsTesting(true);
    setTestResult(null);
    const result = await testWasenderConnection(testPhone.trim());
    setTestResult({
      success: result.success,
      message: result.success
        ? '✅ Test message sent successfully!'
        : `❌ ${result.error ?? 'Unknown error'}`,
    });
    setIsTesting(false);
  };

  // ── Shared: Locked token display ─────────────────────────────────────────────
  const LockedTokenField = () => (
    <div className="space-y-2">
      <label className="text-sm font-bold text-gray-500 flex items-center gap-2">
        Personal Access Token
        <span className="inline-flex items-center gap-1 text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          <Lock size={10} />
          Read-only
        </span>
      </label>
      <div className="relative">
        <input
          type="password"
          value={savedToken || tokenInput}
          readOnly
          title="Contact your developer to change this"
          className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-gray-400 cursor-not-allowed select-none pr-12"
        />
        <Lock
          size={16}
          className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-300"
        />
      </div>
      <p className="text-xs text-gray-400">Contact your developer to change this token.</p>
    </div>
  );

  // ── Shared: Step indicator ───────────────────────────────────────────────────
  const steps: Record<TabScreen, number> = {
    token_entry: 1,
    session_setup: 2,
    connecting: 3,
    connected: 3,
  };

  const StepIndicator = ({ current }: { current: number }) => (
    <div className="flex items-center gap-2 mb-6">
      {[1, 2, 3].map(s => (
        <div key={s} className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${s < current
              ? 'bg-green-500 text-white'
              : s === current
                ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                : 'bg-gray-100 text-gray-400'
            }`}>
            {s < current ? '✓' : s}
          </div>
          {s < 3 && <div className={`h-px w-8 ${s < current ? 'bg-green-400' : 'bg-gray-200'}`} />}
        </div>
      ))}
      <span className="ms-2 text-xs font-medium text-gray-400">Step {current} of 3</span>
    </div>
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">

      {/* Error banner */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-medium flex items-start gap-3">
          <span className="shrink-0 mt-0.5">❌</span>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ms-auto text-red-400 hover:text-red-600 shrink-0">✕</button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          SCREEN 1 — Token Entry
      ════════════════════════════════════════════════════════════════════════ */}
      {screen === 'token_entry' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-1">
              📱 WhatsApp Setup
            </h3>
            <StepIndicator current={1} />
          </div>

          <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-2">
            <p className="text-sm font-bold text-indigo-800">Where to find your token:</p>
            <ol className="text-sm text-indigo-700 space-y-1 list-decimal list-inside font-medium">
              <li>Sign up at <a href="https://wasenderapi.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-900">wasenderapi.com</a></li>
              <li>Go to <strong>Settings → API Tokens</strong></li>
              <li>Copy your <strong>Personal Access Token</strong></li>
            </ol>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">
              Personal Access Token <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveToken()}
              placeholder="pat_xxxxxxxxxxxxxxxx"
              autoComplete="off"
              className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-sm flex items-start gap-2">
            <span className="shrink-0">⚠️</span>
            <span>Once saved, this token <strong>cannot be changed here</strong>. Contact your developer to update it.</span>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={!tokenInput.trim() || isSavingToken}
              onClick={handleSaveToken}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all disabled:opacity-50"
            >
              {isSavingToken ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save Token &amp; Continue →
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          SCREEN 2 — Session Setup
      ════════════════════════════════════════════════════════════════════════ */}
      {screen === 'session_setup' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-1">
              📱 WhatsApp Setup
            </h3>
            <StepIndicator current={2} />
          </div>

          <LockedTokenField />

          <div className="h-px bg-gray-100" />

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">
              Session Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={sessionName}
              onChange={e => setSessionName(e.target.value)}
              placeholder="e.g. Jacob Store WhatsApp"
              className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">
              WhatsApp Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={e => setPhoneNumber(e.target.value)}
              placeholder="+201012345678"
              className="w-full px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            />
            <p className="text-xs text-gray-400">The number you want to connect to WhatsApp (with country code).</p>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              disabled={!sessionName.trim() || !phoneNumber.trim() || isCreatingSession}
              onClick={handleCreateSession}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all disabled:opacity-50"
            >
              {isCreatingSession ? <Loader2 className="animate-spin" size={18} /> : <Smartphone size={18} />}
              {isCreatingSession ? 'Creating session…' : 'Create Session & Continue →'}
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          SCREEN 3 — Connecting (QR / Phone)
      ════════════════════════════════════════════════════════════════════════ */}
      {screen === 'connecting' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-1">
              📱 WhatsApp Setup
            </h3>
            <StepIndicator current={3} />
          </div>

          {/* Method tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1 w-fit">
            <button
              onClick={() => setConnectTab('qr')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${connectTab === 'qr'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              QR Code
            </button>
            <button
              onClick={() => setConnectTab('phone')}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${connectTab === 'phone'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              Phone Number
            </button>
          </div>

          {/* QR Code tab */}
          {connectTab === 'qr' && (
            <div className="space-y-5">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                <p className="text-sm font-bold text-blue-800 mb-2">Scan to connect your WhatsApp:</p>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside font-medium">
                  <li>Open WhatsApp on your phone</li>
                  <li>Tap ⋮ (Menu) → <strong>Linked Devices</strong></li>
                  <li>Tap <strong>Link a Device</strong></li>
                  <li>Scan the QR code below</li>
                </ol>
              </div>

              <div className="flex flex-col items-start gap-4">
                {/* QR Display */}
                {isLoadingQR ? (
                  <div className="w-56 h-56 bg-gray-100 rounded-2xl flex items-center justify-center border border-gray-200">
                    <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
                  </div>
                ) : qrString ? (
                  <div className="p-3 bg-white border-2 border-gray-200 rounded-2xl shadow-sm">
                    <QRCodeSVG value={qrString} size={224} />
                  </div>
                ) : (
                  <div className="w-56 h-56 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 text-sm border border-gray-200 flex-col gap-2">
                    <WifiOff size={24} className="text-gray-300" />
                    <span>Failed to load QR</span>
                  </div>
                )}

                {/* Auto-refresh note + manual refresh */}
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                    <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse inline-block" />
                    Auto-refreshes every 45 seconds
                  </span>
                  <button
                    onClick={handleRefreshQR}
                    disabled={isLoadingQR}
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50 bg-white"
                  >
                    <RefreshCw size={12} className={isLoadingQR ? 'animate-spin' : ''} />
                    Refresh manually
                  </button>
                </div>

                {/* Waiting indicator */}
                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                  <div className="animate-spin w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full" />
                  Waiting for scan… page updates automatically.
                </div>
              </div>
            </div>
          )}

          {/* Phone Number tab */}
          {connectTab === 'phone' && (
            <div className="p-6 bg-gray-50 border border-gray-200 rounded-2xl text-center space-y-3">
              <Smartphone size={32} className="text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-gray-600">Phone number pairing coming soon.</p>
              <p className="text-xs text-gray-400">
                For now, please use the QR code tab to link your device.<br />
                Or visit{' '}
                <a
                  href="https://wasenderapi.com/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-500 underline"
                >
                  Wasender docs
                </a>{' '}
                for manual pairing instructions.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          SCREEN 4 — Connected
      ════════════════════════════════════════════════════════════════════════ */}
      {screen === 'connected' && (
        <div className="space-y-8">

          {/* Connected header */}
          <div className="p-5 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shrink-0">
              <Smartphone size={22} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
                <p className="font-black text-green-800 text-lg">WhatsApp Connected ✅</p>
              </div>
              <p className="text-sm text-green-600 mt-0.5">Session is active and ready to send messages.</p>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Locked token */}
          <LockedTokenField />

          <div className="h-px bg-gray-100" />

          {/* ── Test Message ─────────────────────────────────────────────────── */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <div className="w-2 h-5 bg-blue-500 rounded-full" />
              Test Message
            </h3>
            <div className="flex gap-3">
              <input
                type="tel"
                value={testPhone}
                onChange={e => setTestPhone(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleTestMessage()}
                placeholder="+20 1012345678"
                className="flex-1 px-5 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
              <button
                type="button"
                disabled={isTesting || !testPhone.trim()}
                onClick={handleTestMessage}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-100 transition-all disabled:opacity-50 shrink-0"
              >
                {isTesting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
                Send Test
              </button>
            </div>
            {testResult && (
              <div className={`px-4 py-3 rounded-xl text-sm font-medium border ${testResult.success
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-red-50 border-red-200 text-red-700'
                }`}>
                {testResult.message}
              </div>
            )}
          </div>

          <div className="h-px bg-gray-100" />

          {/* ── Notification Toggles ─────────────────────────────────────────── */}
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
              <div className="w-2 h-5 bg-orange-500 rounded-full" />
              Send Notifications via WhatsApp
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {([
                { key: 'whatsapp_notify_orders' as keyof typeof notifySettings, label: 'Order placed' },
                { key: 'whatsapp_notify_maintenance' as keyof typeof notifySettings, label: 'Maintenance request received' },
                { key: 'whatsapp_notify_status_update' as keyof typeof notifySettings, label: 'Maintenance status update' },
                { key: 'whatsapp_notify_credentials' as keyof typeof notifySettings, label: 'New account credentials' },
              ] as const).map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 cursor-pointer hover:bg-white hover:border-orange-300 transition-all"
                >
                  <input
                    type="checkbox"
                    checked={notifySettings[key] === 'true'}
                    onChange={e =>
                      setNotifySettings({ ...notifySettings, [key]: e.target.checked ? 'true' : 'false' })
                    }
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
                onClick={() =>
                  onSave(
                    Object.entries(notifySettings).map(([key, value]) => ({
                      key: key as keyof SettingsMap,
                      value,
                    }))
                  )
                }
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-orange-100 transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Save Notification Settings
              </button>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* ── Disconnect ───────────────────────────────────────────────────── */}
          <div className="flex justify-start">
            <button
              type="button"
              onClick={handleDisconnect}
              className="flex items-center gap-2 text-red-600 border border-red-200 bg-white hover:bg-red-50 px-6 py-3 rounded-2xl font-bold text-sm transition-colors shadow-sm"
            >
              <LogOut size={16} />
              Disconnect WhatsApp
            </button>
          </div>

        </div>
      )}

    </div>
  );
}
