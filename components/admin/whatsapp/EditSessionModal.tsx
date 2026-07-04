'use client'

import { useState } from 'react'
import { X, Save, Loader2 } from 'lucide-react'
import { WasenderSession, UpdateSessionPayload } from '@/types'
import { updateSession } from '@/lib/actions/wasender-sessions'

const WEBHOOK_EVENT_OPTIONS = [
  { value: 'messages.received', label: 'messages.received' },
  { value: 'session.status',    label: 'session.status' },
  { value: 'messages.update',   label: 'messages.update' },
  { value: 'group_update',      label: 'group_update' },
  { value: 'messages.sent',     label: 'messages.sent' },
]

interface EditSessionModalProps {
  session: WasenderSession
  onSuccess: (updated: WasenderSession) => void
  onClose: () => void
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-4 py-3 border-b border-gray-50 cursor-pointer group">
      <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none ${
          checked ? 'bg-indigo-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </label>
  )
}

export function EditSessionModal({ session, onSuccess, onClose }: EditSessionModalProps) {
  const [name, setName]               = useState(session.name)
  const [phone, setPhone]             = useState(session.phone_number)
  const [accountProtection, setAP]    = useState(session.account_protection)
  const [logMessages, setLog]         = useState(session.log_messages)
  const [alwaysOnline, setAlways]     = useState(false)
  const [autoRejectCalls, setReject]  = useState(false)
  const [readIncoming, setRead]       = useState(false)
  const [webhookUrl, setWebhookUrl]   = useState(session.webhook_url ?? '')
  const [webhookEnabled, setWHEnabled] = useState(session.webhook_enabled)
  const [webhookEvents, setWHEvents]  = useState<string[]>(session.webhook_events ?? [])

  const [isSaving, setIsSaving] = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const toggleEvent = (value: string) => {
    setWHEvents(prev =>
      prev.includes(value) ? prev.filter(e => e !== value) : [...prev, value]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    const payload: UpdateSessionPayload = {
      name:                   name.trim() || undefined,
      phone_number:           phone.trim() || undefined,
      account_protection:     accountProtection,
      log_messages:           logMessages,
      always_online:          alwaysOnline,
      auto_reject_calls:      autoRejectCalls,
      read_incoming_messages: readIncoming,
      webhook_url:            webhookUrl.trim() || undefined,
      webhook_enabled:        webhookEnabled,
      webhook_events:         webhookEvents,
    }

    const result = await updateSession(session.id, payload)
    setIsSaving(false)

    if (!result.success) {
      setError(result.error ?? 'Failed to update session')
      return
    }

    // Merge updated fields into the original session object
    const merged: WasenderSession = {
      ...session,
      ...(result.session ?? {}),
      name: name.trim() || session.name,
      phone_number: phone.trim() || session.phone_number,
    }
    onSuccess(merged)
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-black text-slate-800">Edit Session</h2>
            <p className="text-sm text-gray-500 mt-0.5">{session.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
              ❌ {error}
            </div>
          )}

          {/* Basic fields */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">Basic Info</h3>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600">Session Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
              />
            </div>
          </div>

          {/* Feature toggles */}
          <div className="space-y-1">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Features</h3>
            <Toggle label="Account Protection"     checked={accountProtection} onChange={setAP} />
            <Toggle label="Log Messages"           checked={logMessages}       onChange={setLog} />
            <Toggle label="Always Online"          checked={alwaysOnline}      onChange={setAlways} />
            <Toggle label="Auto Reject Calls"      checked={autoRejectCalls}   onChange={setReject} />
            <Toggle label="Read Incoming Messages" checked={readIncoming}       onChange={setRead} />
          </div>

          {/* Webhook */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider">Webhook</h3>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600">Webhook URL</label>
              <input
                type="url"
                value={webhookUrl}
                onChange={e => setWebhookUrl(e.target.value)}
                placeholder="https://your-server.com/webhook"
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm"
              />
            </div>
            <Toggle label="Webhook Enabled" checked={webhookEnabled} onChange={setWHEnabled} />
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600">Webhook Events</label>
              <div className="space-y-2 ps-1">
                {WEBHOOK_EVENT_OPTIONS.map(opt => (
                  <label key={opt.value} className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={webhookEvents.includes(opt.value)}
                      onChange={() => toggleEvent(opt.value)}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-mono text-gray-600">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-100 transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
