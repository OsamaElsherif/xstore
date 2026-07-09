'use client'

import { QRCodeSVG } from 'qrcode.react'
import { RefreshCw, WifiOff } from 'lucide-react'

/**
 * QRDisplay — pure presentational component.
 * All session logic (create, connect, poll, refresh intervals) lives in WhatsAppTab.
 * This just renders whatever qrString it receives.
 */
export function QRDisplay({
  qrString,
  isLoading,
  onRefresh,
}: {
  qrString: string | null
  isLoading: boolean
  onRefresh: () => void
}) {
  if (isLoading) {
    return (
      <div className="w-56 h-56 bg-gray-100 rounded-2xl flex items-center justify-center border border-gray-200">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!qrString) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div className="w-56 h-56 bg-gray-100 rounded-2xl flex items-center justify-center flex-col gap-2 border border-gray-200">
          <WifiOff size={24} className="text-gray-300" />
          <span className="text-sm text-gray-400">Failed to load QR</span>
        </div>
        <button
          onClick={onRefresh}
          className="text-xs font-medium text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          <RefreshCw size={12} className="inline me-1" />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="p-3 bg-white border-2 border-gray-200 rounded-2xl shadow-sm">
        <QRCodeSVG value={qrString} size={224} />
      </div>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
          <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse inline-block" />
          Auto-refreshes every 45 seconds
        </span>
        <button
          onClick={onRefresh}
          className="text-xs font-medium text-indigo-600 border border-indigo-200 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          <RefreshCw size={12} className="inline me-1" />
          Refresh
        </button>
      </div>
    </div>
  )
}

/**
 * QRConnection — legacy alias for backwards-compat.
 * Any existing imports of QRConnection will continue to work;
 * the component now renders the same QRDisplay.
 */
export function QRConnection({
  qrString,
  isLoading,
  onRefresh,
}: {
  qrString: string | null
  isLoading?: boolean
  onRefresh: () => void
}) {
  return <QRDisplay qrString={qrString} isLoading={isLoading ?? false} onRefresh={onRefresh} />
}

export default QRDisplay
