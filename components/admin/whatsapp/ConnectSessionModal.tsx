'use client'

import { useState, useEffect } from 'react'
import { X, RefreshCw, WifiOff } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import { WasenderSession } from '@/types'
import { refreshSessionQR, getSessionStatus } from '@/lib/actions/wasender-sessions'

const QR_EXPIRY_MS = 44_000
const STATUS_POLL_MS = 5_000

interface ConnectSessionModalProps {
  session: WasenderSession
  initialQR: string | null
  onConnected: () => void
  onClose: () => void
}

export function ConnectSessionModal({
  session,
  initialQR,
  onConnected,
  onClose,
}: ConnectSessionModalProps) {
  const [qrString, setQrString] = useState<string | null>(initialQR)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // ── Polling + auto-refresh ──────────────────────────────────────────────────
  useEffect(() => {
    // Refresh QR every 44s (just before 45s expiry)
    const qrTimer = setInterval(async () => {
      const result = await refreshSessionQR(session.id)
      if (result.qrString) setQrString(result.qrString)
    }, QR_EXPIRY_MS)

    // Poll status every 5s — stop when connected
    const statusTimer = setInterval(async () => {
      const result = await getSessionStatus(session.id)
      const status = result.status?.toLowerCase()
      if (status === 'connected') {
        clearInterval(qrTimer)
        clearInterval(statusTimer)
        onConnected()
      }
    }, STATUS_POLL_MS)

    return () => {
      clearInterval(qrTimer)
      clearInterval(statusTimer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleManualRefresh = async () => {
    setIsRefreshing(true)
    const result = await refreshSessionQR(session.id)
    if (result.qrString) setQrString(result.qrString)
    setIsRefreshing(false)
  }

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-black text-slate-800">Connect WhatsApp</h2>
            <p className="text-sm text-gray-500 mt-0.5">{session.name}</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Instructions */}
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
            <p className="text-sm font-bold text-blue-800 mb-2">Scan to link your device:</p>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside font-medium">
              <li>Open WhatsApp on your phone</li>
              <li>Tap ⋮ (Menu) → <strong>Linked Devices</strong></li>
              <li>Tap <strong>Link a Device</strong></li>
              <li>Scan the QR code below</li>
            </ol>
          </div>

          {/* QR Display */}
          <div className="flex flex-col items-center gap-4">
            {qrString ? (
              <div className="p-3 bg-white border-2 border-gray-200 rounded-2xl shadow-sm">
                <QRCodeSVG value={qrString} size={224} />
              </div>
            ) : (
              <div className="w-56 h-56 bg-gray-100 rounded-2xl flex flex-col items-center justify-center gap-2 border border-gray-200">
                <WifiOff size={28} className="text-gray-300" />
                <span className="text-sm text-gray-400">No QR available</span>
              </div>
            )}

            {/* Auto-refresh + manual refresh */}
            <div className="flex items-center gap-3 flex-wrap justify-center">
              <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse inline-block" />
                Auto-refreshes every 45 seconds
              </span>
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={11} className={isRefreshing ? 'animate-spin' : ''} />
                Refresh QR
              </button>
            </div>

            {/* Waiting indicator */}
            <div className="flex items-center gap-2 text-sm text-gray-400 font-medium">
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              Waiting for scan… updates automatically
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
