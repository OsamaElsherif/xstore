'use client'

import React, { useState, useEffect } from 'react'
import { Eye, EyeOff, Copy, RefreshCw, Loader2, Check, Shield, FileText, Calendar, Key, AlertTriangle } from 'lucide-react'
import { WasenderSession } from '@/types'
import { getSessionDetails, getSessionStatus } from '@/lib/actions/wasender-sessions'
import { useLanguage } from '@/contexts/LanguageContext'

interface SessionDetailsPanelProps {
  sessionId: number
  initialSession: WasenderSession
}

export function SessionDetailsPanel({ sessionId, initialSession }: SessionDetailsPanelProps) {
  const { t } = useLanguage()
  const [session, setSession] = useState<WasenderSession>(initialSession)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingLiveStatus, setIsCheckingLiveStatus] = useState(false)
  const [liveStatus, setLiveStatus] = useState<string | null>(null)
  
  const [showApiKey, setShowApiKey] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)

  // Fetch full details (including API Key) lazily on expand
  useEffect(() => {
    async function fetchDetails() {
      setIsLoading(true)
      const result = await getSessionDetails(sessionId)
      if (result.success && result.session) {
        setSession(result.session)
      }
      setIsLoading(false)
    }
    fetchDetails()
  }, [sessionId])

  const handleCheckLiveStatus = async () => {
    setIsCheckingLiveStatus(true)
    setLiveStatus(null)
    const result = await getSessionStatus(sessionId)
    if (result.success && result.status) {
      setLiveStatus(result.status)
    } else {
      setLiveStatus('error')
    }
    setIsCheckingLiveStatus(false)
  }

  const copyToClipboard = async (text: string, type: 'key' | 'secret') => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === 'key') {
        setCopiedKey(true)
        setTimeout(() => setCopiedKey(false), 2000)
      } else {
        setCopiedSecret(true)
        setTimeout(() => setCopiedSecret(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return dateStr
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 gap-2 bg-slate-50/50 rounded-2xl border border-slate-100">
        <Loader2 className="animate-spin text-indigo-600" size={20} />
        <span className="text-sm font-semibold text-slate-500">Loading details…</span>
      </div>
    )
  }

  return (
    <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-6 space-y-6 animate-in fade-in slide-in-from-top-4 duration-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Session Configurations */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Shield size={14} className="text-slate-400" />
            Configurations
          </h4>
          <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between p-3.5 text-sm">
              <span className="font-semibold text-slate-500">ID</span>
              <span className="font-mono text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">{session.id}</span>
            </div>
            <div className="flex items-center justify-between p-3.5 text-sm">
              <span className="font-semibold text-slate-500">{t('labelAccountProtection')}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                session.account_protection
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {session.account_protection ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3.5 text-sm">
              <span className="font-semibold text-slate-500">{t('labelLogMessages')}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                session.log_messages
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {session.log_messages ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>

          {/* Timestamps */}
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pt-2">
            <Calendar size={14} className="text-slate-400" />
            Activity &amp; Dates
          </h4>
          <div className="bg-white rounded-xl border border-slate-100 divide-y divide-slate-100 overflow-hidden shadow-sm">
            <div className="flex items-center justify-between p-3.5 text-sm">
              <span className="font-semibold text-slate-500">{t('labelCreated')}</span>
              <span className="font-medium text-slate-700">{formatDate(session.created_at)}</span>
            </div>
            <div className="flex items-center justify-between p-3.5 text-sm">
              <span className="font-semibold text-slate-500">{t('labelUpdated')}</span>
              <span className="font-medium text-slate-700">{formatDate(session.updated_at)}</span>
            </div>
          </div>
        </div>

        {/* Webhook Settings */}
        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText size={14} className="text-slate-400" />
            Webhook Integration
          </h4>
          <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-4 shadow-sm">
            <div className="flex justify-between items-start gap-4">
              <span className="text-sm font-semibold text-slate-500 whitespace-nowrap">{t('labelWebhookEnabled')}</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                session.webhook_enabled
                  ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {session.webhook_enabled ? 'Yes' : 'No'}
              </span>
            </div>
            
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t('labelWebhookUrl')}</span>
              <div className="bg-slate-50 px-3 py-2 rounded-xl text-xs font-mono text-slate-600 break-all border border-slate-100 min-h-[34px] flex items-center">
                {session.webhook_url ?? 'None'}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">{t('labelWebhookEvents')}</span>
              <div className="flex flex-wrap gap-1.5">
                {session.webhook_events && session.webhook_events.length > 0 ? (
                  session.webhook_events.map(ev => (
                    <span key={ev} className="bg-slate-100 text-slate-700 text-xs font-semibold px-2 py-0.5 rounded-md border border-slate-200">
                      {ev}
                    </span>
                  ))
                ) : (
                  <span className="text-xs font-medium text-slate-400 italic">No events subscribed</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security credentials (api key & webhook secret) */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4 shadow-sm">
        <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Key size={14} className="text-slate-400" />
          Credentials
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* API Key */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Session API Key</span>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  readOnly
                  value={session.api_key ?? ''}
                  placeholder="Not loaded or absent"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 focus:outline-none focus:ring-0 select-all pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute end-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                >
                  {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(session.api_key ?? '', 'key')}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-colors shrink-0"
                title="Copy API Key"
              >
                {copiedKey ? <Check size={14} className="text-green-600 animate-in zoom-in" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Webhook Secret */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Webhook Secret</span>
            <div className="flex gap-2">
              <input
                type="password"
                readOnly
                value={session.webhook_secret ?? ''}
                placeholder="None or hidden"
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600 focus:outline-none focus:ring-0 select-all"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(session.webhook_secret ?? '', 'secret')}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 hover:text-indigo-600 transition-colors shrink-0"
                title="Copy Webhook Secret"
              >
                {copiedSecret ? <Check size={14} className="text-green-600 animate-in zoom-in" /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Live Status Action Bar */}
      <div className="h-px bg-slate-100" />
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-500">Live Status:</span>
          {isCheckingLiveStatus ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-200">
              <Loader2 className="animate-spin" size={12} /> Checking Live…
            </span>
          ) : liveStatus ? (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
              liveStatus.toLowerCase() === 'connected'
                ? 'bg-green-50 text-green-700 border-green-200'
                : liveStatus === 'error'
                ? 'bg-red-50 text-red-700 border-red-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
              {liveStatus === 'error' ? 'Failed to fetch status' : liveStatus}
            </span>
          ) : (
            <span className="text-xs text-slate-400 italic">Not checked yet</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleCheckLiveStatus}
          disabled={isCheckingLiveStatus}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-xs transition-all disabled:opacity-50 shadow-sm"
        >
          {isCheckingLiveStatus ? <Loader2 className="animate-spin" size={13} /> : <RefreshCw size={13} />}
          {t('btnCheckLiveStatus')}
        </button>
      </div>
    </div>
  )
}
