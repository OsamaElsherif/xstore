'use client'

import React, { useState, useEffect, useRef } from 'react'
import { MoreVertical, Eye, Edit2, Link2, Link2Off, RefreshCw, CheckCircle, Trash2, Loader2 } from 'lucide-react'
import { WasenderSession } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'

interface SessionActionsMenuProps {
  session: WasenderSession
  isActive: boolean
  loadingAction: string | null
  onAction: (action: string) => void
}

export function SessionActionsMenu({
  session,
  isActive,
  loadingAction,
  onAction,
}: SessionActionsMenuProps) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isConnected = session.status.toLowerCase() === 'connected'

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleActionClick = (action: string) => {
    setIsOpen(false)
    onAction(action)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
        aria-label="Actions Menu"
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && (
        <div className="absolute end-0 top-12 z-20 w-52 bg-white rounded-2xl border border-slate-100 shadow-xl py-2 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* View Details */}
          <button
            onClick={() => handleActionClick('view_details')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-start"
          >
            <Eye size={16} className="text-slate-400" />
            <span>{t('actionViewDetails')}</span>
          </button>

          {/* Edit */}
          <button
            onClick={() => handleActionClick('edit')}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-start"
          >
            <Edit2 size={16} className="text-slate-400" />
            <span>{t('actionEdit')}</span>
          </button>

          <div className="h-px bg-slate-100 my-1" />

          {/* Connect / Disconnect */}
          {!isConnected ? (
            <button
              onClick={() => handleActionClick('connect')}
              disabled={loadingAction !== null}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-start disabled:opacity-50"
            >
              {loadingAction === 'connect' ? (
                <Loader2 size={16} className="text-indigo-600 animate-spin" />
              ) : (
                <Link2 size={16} className="text-slate-400" />
              )}
              <span>{t('actionConnect')}</span>
            </button>
          ) : (
            <button
              onClick={() => handleActionClick('disconnect')}
              disabled={loadingAction !== null}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-start disabled:opacity-50"
            >
              {loadingAction === 'disconnect' ? (
                <Loader2 size={16} className="text-red-500 animate-spin" />
              ) : (
                <Link2Off size={16} className="text-slate-400" />
              )}
              <span>{t('actionDisconnect')}</span>
            </button>
          )}

          {/* Restart */}
          <button
            onClick={() => handleActionClick('restart')}
            disabled={loadingAction !== null}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-start disabled:opacity-50"
          >
            {loadingAction === 'restart' ? (
              <Loader2 size={16} className="text-indigo-600 animate-spin" />
            ) : (
              <RefreshCw size={16} className="text-slate-400" />
            )}
            <span>{t('actionRestart')}</span>
          </button>

          <div className="h-px bg-slate-100 my-1" />

          {/* Set as Active */}
          {!isActive && (
            <button
              onClick={() => handleActionClick('set_active')}
              disabled={loadingAction !== null}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors text-start disabled:opacity-50"
            >
              {loadingAction === 'set_active' ? (
                <Loader2 size={16} className="text-green-600 animate-spin" />
              ) : (
                <CheckCircle size={16} className="text-slate-400" />
              )}
              <span>{t('actionSetActive')}</span>
            </button>
          )}

          <div className="h-px bg-slate-100 my-1" />

          {/* Delete */}
          <button
            onClick={() => handleActionClick('delete')}
            disabled={loadingAction !== null}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors text-start disabled:opacity-50"
          >
            {loadingAction === 'delete' ? (
              <Loader2 size={16} className="text-red-600 animate-spin" />
            ) : (
              <Trash2 size={16} className="text-red-400" />
            )}
            <span>{t('actionDelete')}</span>
          </button>
        </div>
      )}
    </div>
  )
}
