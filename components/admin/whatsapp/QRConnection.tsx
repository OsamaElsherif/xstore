'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Loader2, RefreshCw, LogOut, Smartphone } from 'lucide-react'
import { getGreenApiState, getGreenApiQR, logoutGreenApi } from '@/lib/actions/greenapi'

type ConnState = 'checking' | 'authorized' | 'notAuthorized' | 'notConfigured' | 'error'

interface QRConnectionProps {
  instanceId: string
  apiToken: string
  onConnected?: () => void
}

export default function QRConnection({ instanceId, apiToken, onConnected }: QRConnectionProps) {
  const [connectionState, setConnectionState] = useState<ConnState>('checking')
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [isLoadingQR, setIsLoadingQR] = useState(false)
  const [waAccountInfo, setWaAccountInfo] = useState<string | null>(null)

  const [isCheckingManual, setIsCheckingManual] = useState(false)

  // Keep interval refs so we can clear them precisely when authorized
  const qrTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stateTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearAllIntervals = () => {
    if (qrTimerRef.current) { clearInterval(qrTimerRef.current); qrTimerRef.current = null }
    if (stateTimerRef.current) { clearInterval(stateTimerRef.current); stateTimerRef.current = null }
  }

  // ── Fetch account info via server proxy ───────────────────────────────────
  const fetchAccountInfo = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/account-info')
      const data = await res.json()
      if (data.wid) setWaAccountInfo(data.wid)
    } catch {
      setWaAccountInfo(null)
    }
  }, [])

  // ── Load QR code ──────────────────────────────────────────────────────────
  const loadQR = useCallback(async () => {
    setIsLoadingQR(true)
    const result = await getGreenApiQR()
    setIsLoadingQR(false)

    if (result.message === 'alreadyLogged') {
      setConnectionState('authorized')
      setQrCode(null)
      clearAllIntervals()
      fetchAccountInfo()
      onConnected?.()
    } else if (result.qrCode) {
      const src = result.qrCode.startsWith('data:')
        ? result.qrCode
        : `data:image/png;base64,${result.qrCode}`
      setQrCode(src)
    }
  }, [fetchAccountInfo, onConnected])

  // ── Check instance state ──────────────────────────────────────────────────
  const checkState = useCallback(async (isManual = false) => {
    if (isManual) setIsCheckingManual(true)
    const result = await getGreenApiState()
    const s = result.state as ConnState

    if (s === 'authorized') {
      setConnectionState('authorized')
      setQrCode(null)
      clearAllIntervals()
      fetchAccountInfo()
      onConnected?.()
    } else if (s === 'notAuthorized') {
      setConnectionState('notAuthorized')
    } else {
      setConnectionState(s)
    }
    if (isManual) setIsCheckingManual(false)
  }, [fetchAccountInfo, onConnected])

  // ── On mount / when credentials change ───────────────────────────────────
  useEffect(() => {
    clearAllIntervals()
    setConnectionState('checking')
    checkState()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instanceId, apiToken])

  // ── Start intervals when not authorized ──────────────────────────────────
  useEffect(() => {
    if (connectionState !== 'notAuthorized') return

    // Load QR immediately on entering notAuthorized state
    loadQR()

    // Refresh QR every 20s (it expires)
    qrTimerRef.current = setInterval(loadQR, 20000)
    // Poll state every 5s to detect scan
    stateTimerRef.current = setInterval(() => checkState(false), 5000)

    return () => clearAllIntervals()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionState])

  // ── Disconnect ────────────────────────────────────────────────────────────
  const handleDisconnect = async () => {
    clearAllIntervals()
    await logoutGreenApi()
    setWaAccountInfo(null)
    setConnectionState('notAuthorized')
    // Effect above will restart intervals + load QR
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Status control header */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-gray-50 border border-gray-100 rounded-2xl p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-500">Current Status:</span>
          {connectionState === 'checking' || isCheckingManual ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-50 text-yellow-700 border border-yellow-200">
              <Loader2 className="animate-spin" size={12} /> Checking…
            </span>
          ) : connectionState === 'authorized' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
              ● Connected
            </span>
          ) : connectionState === 'notAuthorized' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
              ● Disconnected
            </span>
          ) : connectionState === 'notConfigured' ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
              ● Not Configured
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-600 border border-gray-200">
              Unknown
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => checkState(true)}
          disabled={isCheckingManual || connectionState === 'checking'}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-xs transition-all disabled:opacity-50 shadow-sm"
        >
          {isCheckingManual ? (
            <Loader2 className="animate-spin" size={13} />
          ) : (
            <RefreshCw size={13} />
          )}
          Check Status
        </button>
      </div>

      {/* Connection State Details */}
      {connectionState === 'notConfigured' && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl text-center">
          <p className="text-amber-700 font-medium text-sm">
            ⚠️ Save your Instance ID and API Token first to enable the connection.
          </p>
        </div>
      )}
      {connectionState === 'checking' && (
        <div className="p-8 text-center text-gray-500 bg-gray-50 border border-gray-150 rounded-2xl">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm font-medium">Verifying instance connection…</p>
        </div>
      )}

      {connectionState === 'authorized' && (
        <div className="p-5 bg-green-50 border border-green-200 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
              <Smartphone size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="font-bold text-green-800">WhatsApp Connected</p>
              </div>
              {waAccountInfo && (
                <p className="text-sm text-green-600 mt-0.5">{waAccountInfo}</p>
              )}
              {!waAccountInfo && (
                <p className="text-xs text-green-500 mt-0.5">Instance active and ready to send messages</p>
              )}
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors bg-white shrink-0 shadow-sm"
          >
            <LogOut size={14} />
            Disconnect
          </button>
        </div>
      )}

      {connectionState === 'notAuthorized' && (
        <div className="space-y-5">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
            <p className="text-sm font-bold text-blue-800 mb-2">📱 Scan to connect WhatsApp</p>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside font-medium">
              <li>Open WhatsApp on your phone</li>
              <li>Tap Menu (⋮) → Linked Devices</li>
              <li>Tap "Link a Device"</li>
              <li>Scan the QR code below</li>
            </ol>
          </div>

          <div className="flex flex-col items-start gap-4">
            {isLoadingQR ? (
              <div className="w-56 h-56 bg-gray-100 rounded-2xl flex items-center justify-center border border-gray-200">
                <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
              </div>
            ) : qrCode ? (
              <div className="p-3 bg-white border-2 border-gray-200 rounded-2xl shadow-sm">
                <img src={qrCode} alt="WhatsApp QR Code" width={224} height={224} className="rounded-lg" />
              </div>
            ) : (
              <div className="w-56 h-56 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 text-sm border border-gray-200">
                Failed to load QR
              </div>
            )}

            <div className="flex items-center gap-3">
              <button
                onClick={() => loadQR()}
                disabled={isLoadingQR}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors disabled:opacity-50 bg-white shadow-sm"
              >
                <RefreshCw size={14} className={isLoadingQR ? 'animate-spin' : ''} />
                Refresh QR
              </button>
              <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                QR auto-refreshes every 20 seconds
              </div>
            </div>

            <p className="text-xs text-gray-400 font-medium">
              Waiting for scan… page updates automatically.
            </p>
          </div>
        </div>
      )}

      {connectionState === 'error' && (
        <div className="p-5 bg-red-50 border border-red-200 rounded-2xl text-center">
          <p className="text-red-600 text-sm font-medium">Connection error. Check your credentials and try again.</p>
          <button onClick={() => checkState(true)} className="mt-3 text-sm text-red-600 underline font-bold">
            Retry
          </button>
        </div>
      )}
    </div>
  )
}
