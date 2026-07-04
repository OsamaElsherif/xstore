'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { RefreshCw, Plus, ShieldAlert, Smartphone, ArrowRight } from 'lucide-react'
import { WasenderSession } from '@/types'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  getAllSessions,
  deleteSession,
  restartSession,
  connectSession,
  disconnectSession,
  setActiveSession,
  getSessionDetails
} from '@/lib/actions/wasender-sessions'
import { SessionActionsMenu } from './SessionActionsMenu'
import { SessionDetailsPanel } from './SessionDetailsPanel'
import { EditSessionModal } from './EditSessionModal'
import { ConnectSessionModal } from './ConnectSessionModal'

interface SessionsManagerProps {
  initialSessions: WasenderSession[]
  activeSessionId: string | null
  error?: string
}

export function SessionsManager({
  initialSessions,
  activeSessionId: initialActiveId,
  error: fetchError,
}: SessionsManagerProps) {
  const { t } = useLanguage()
  const [sessions, setSessions] = useState<WasenderSession[]>(initialSessions)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(initialActiveId)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const [editingSession, setEditingSession] = useState<WasenderSession | null>(null)
  const [connectingSession, setConnectingSession] = useState<{
    session: WasenderSession
    qrString: string | null
  } | null>(null)

  const [actionLoading, setActionLoading] = useState<Record<number, string>>({})
  const [managerError, setManagerError] = useState<string | null>(fetchError ?? null)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setManagerError(null)
    const result = await getAllSessions()
    if (result.success && result.sessions) {
      setSessions(result.sessions)
    } else {
      setManagerError(result.error ?? 'Failed to refresh sessions')
    }
    setIsRefreshing(false)
  }

  const setSessionLoadingState = (sessionId: number, actionName: string | null) => {
    setActionLoading(prev => {
      const copy = { ...prev }
      if (actionName === null) {
        delete copy[sessionId]
      } else {
        copy[sessionId] = actionName
      }
      return copy
    })
  }

  const handleAction = async (sessionId: number, actionType: string) => {
    const sessionObj = sessions.find(s => s.id === sessionId)
    if (!sessionObj) return

    setManagerError(null)

    if (actionType === 'view_details') {
      setExpandedId(prev => (prev === sessionId ? null : sessionId))
      return
    }

    if (actionType === 'edit') {
      setEditingSession(sessionObj)
      return
    }

    if (actionType === 'connect') {
      setSessionLoadingState(sessionId, 'connect')
      const result = await connectSession(sessionId)
      setSessionLoadingState(sessionId, null)
      if (result.success) {
        setConnectingSession({
          session: sessionObj,
          qrString: result.qrString ?? null,
        })
      } else {
        setManagerError(result.error ?? 'Failed to connect session')
      }
      return
    }

    if (actionType === 'disconnect') {
      if (!window.confirm('Disconnect WhatsApp? Messages will stop sending until you reconnect.')) return
      setSessionLoadingState(sessionId, 'disconnect')
      const result = await disconnectSession(sessionId)
      setSessionLoadingState(sessionId, null)
      if (result.success) {
        // Refresh full session list to update state
        handleRefresh()
      } else {
        setManagerError(result.error ?? 'Failed to disconnect session')
      }
      return
    }

    if (actionType === 'restart') {
      setSessionLoadingState(sessionId, 'restart')
      const result = await restartSession(sessionId)
      setSessionLoadingState(sessionId, null)
      if (result.success) {
        handleRefresh()
      } else {
        setManagerError(result.error ?? 'Failed to restart session')
      }
      return
    }

    if (actionType === 'set_active') {
      // Must fetch details first or check if api_key is available
      // Note: Detail is fetched lazily. If detail is not expanded, API key won't be in list.
      // So we call details fetching to make sure we have the api_key before setting as active!
      setSessionLoadingState(sessionId, 'set_active')
      const detailsResult = await connectSession(sessionId) // Or just details
      if (detailsResult.success) {
        // Fetch session details specifically for API Key
        const fullDetails = await getAllSessions() // Or detail fetch
        const foundFull = fullDetails.sessions?.find(s => s.id === sessionId)
        // Let's do a direct call to the getSessionDetails API key check
        const directDetails = await getSessionDetails(sessionId)
        if (directDetails.success && directDetails.session?.api_key) {
          const activeResult = await setActiveSession(sessionId, directDetails.session.api_key)
          if (activeResult.success) {
            setActiveSessionId(String(sessionId))
          } else {
            setManagerError(activeResult.error ?? 'Failed to set active session in settings')
          }
        } else {
          setManagerError(directDetails.error ?? 'Failed to fetch session API key to set active')
        }
      } else {
        setManagerError(detailsResult.error ?? 'Failed to set session active')
      }
      setSessionLoadingState(sessionId, null)
      return
    }

    if (actionType === 'delete') {
      if (!window.confirm('Are you sure you want to delete this session? This action is irreversible.')) return
      setSessionLoadingState(sessionId, 'delete')
      const result = await deleteSession(sessionId)
      setSessionLoadingState(sessionId, null)
      if (result.success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId))
        if (activeSessionId === String(sessionId)) {
          setActiveSessionId(null)
        }
      } else {
        setManagerError(result.error ?? 'Failed to delete session')
      }
      return
    }
  }

  // ── Helper to retrieve status color styling ──────────────────────────────────
  const getStatusInfo = (status: string) => {
    const s = status.toLowerCase()
    if (s === 'connected') {
      return {
        dotClass: 'bg-green-500',
        badgeClass: 'bg-green-50 text-green-700 border-green-200',
        label: t('sessionConnected'),
      }
    }
    if (s === 'need_scan' || s === 'connecting') {
      return {
        dotClass: 'bg-yellow-500 animate-pulse',
        badgeClass: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        label: s === 'need_scan' ? t('sessionNeedScan') : t('sessionConnecting'),
      }
    }
    if (s === 'logged_out') {
      return {
        dotClass: 'bg-red-500',
        badgeClass: 'bg-red-50 text-red-700 border-red-200',
        label: t('sessionLoggedOut'),
      }
    }
    return {
      dotClass: 'bg-red-500',
      badgeClass: 'bg-red-50 text-red-700 border-red-200',
      label: t('sessionDisconnected'),
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

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Smartphone className="text-indigo-600" size={24} />
            {t('waSessionsTitle')}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {t('waSessionsDesc')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 shadow-sm"
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            {t('btnRefresh')}
          </button>

          <Link
            href="/admin/settings?tab=whatsapp"
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-100"
          >
            <Plus size={16} />
            {t('btnNew')}
          </Link>
        </div>
      </div>

      {managerError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 text-sm font-semibold flex items-center gap-2">
          <ShieldAlert size={18} className="shrink-0" />
          <span>{managerError}</span>
        </div>
      )}

      {/* Sessions Grid/List */}
      {sessions.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <Smartphone size={32} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800">No Sessions Found</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">
              You haven't configured any Wasender sessions yet.
            </p>
          </div>
          <Link
            href="/admin/settings?tab=whatsapp"
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold text-sm mt-2 transition-colors"
          >
            Create your first session
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sessions.map(session => {
            const isExpanded = expandedId === session.id
            const isActive = activeSessionId === String(session.id)
            const statusInfo = getStatusInfo(session.status)

            return (
              <div
                key={session.id}
                className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-sm ${isExpanded ? 'border-indigo-200 ring-4 ring-indigo-50/50' : 'border-slate-200 hover:border-slate-300'
                  }`}
              >
                {/* Session Card Header */}
                <div className="p-5 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    {/* Status Dot */}
                    <div className={`w-3.5 h-3.5 rounded-full shrink-0 ${statusInfo.dotClass}`} />

                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-black text-slate-800 text-base">{session.name}</span>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-500 text-white shadow-sm shadow-green-200">
                            {t('sessionActive')}
                          </span>
                        )}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusInfo.badgeClass}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 font-medium">
                        <span className="font-semibold">{session.phone_number}</span>
                        <span className="text-slate-300">•</span>
                        <span>{t('labelUpdated')}: {formatDate(session.updated_at)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <SessionActionsMenu
                      session={session}
                      isActive={isActive}
                      loadingAction={actionLoading[session.id] ?? null}
                      onAction={(action) => handleAction(session.id, action)}
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 p-5 bg-slate-50/20">
                  <SessionDetailsPanel
                    sessionId={session.id}
                    initialSession={session}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Edit Session Overlay Modal */}
      {editingSession && (
        <EditSessionModal
          session={editingSession}
          onSuccess={(updatedSession) => {
            setSessions(prev =>
              prev.map(s => (s.id === updatedSession.id ? updatedSession : s))
            )
            setEditingSession(null)
          }}
          onClose={() => setEditingSession(null)}
        />
      )}

      {/* Connect Session Overlay Modal */}
      {connectingSession && (
        <ConnectSessionModal
          session={connectingSession.session}
          initialQR={connectingSession.qrString}
          onConnected={() => {
            setConnectingSession(null)
            handleRefresh()
          }}
          onClose={() => setConnectingSession(null)}
        />
      )}
    </div>
  )
}
