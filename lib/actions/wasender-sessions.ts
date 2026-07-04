'use server'

import { getSetting, saveSettings } from '@/lib/actions/settings'
import { WasenderSession, UpdateSessionPayload } from '@/types'
import { createClient } from '@/lib/supabase/server'

const BASE = 'https://www.wasenderapi.com/api'

// ── Internal helper — verify ADMIN role and return personal token ─────────────
async function getTokenOrThrow(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'ADMIN') throw new Error('Unauthorized')

  const token = await getSetting('wasender_personal_access_token')
  if (!token) throw new Error('Personal Access Token not configured')
  return token
}

// ── Shared headers ────────────────────────────────────────────────────────────
function makeHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

// ── GET ALL SESSIONS ──────────────────────────────────────────────────────────
export async function getAllSessions(): Promise<{
  success: boolean
  sessions?: WasenderSession[]
  error?: string
}> {
  try {
    const token = await getTokenOrThrow()
    const res = await fetch(`${BASE}/whatsapp-sessions`, {
      headers: makeHeaders(token),
      cache: 'no-store',
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      return { success: false, error: data.message ?? 'Failed to fetch sessions' }
    }
    return { success: true, sessions: data.data ?? [] }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ── GET SESSION DETAILS ───────────────────────────────────────────────────────
export async function getSessionDetails(sessionId: number): Promise<{
  success: boolean
  session?: WasenderSession
  error?: string
}> {
  try {
    const token = await getTokenOrThrow()
    const res = await fetch(`${BASE}/whatsapp-sessions/${sessionId}`, {
      headers: makeHeaders(token),
      cache: 'no-store',
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      return { success: false, error: data.message ?? 'Failed to fetch session' }
    }
    return { success: true, session: data.data }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ── GET SESSION STATUS ────────────────────────────────────────────────────────
export async function getSessionStatus(sessionId: number): Promise<{
  success: boolean
  status?: string
  error?: string
}> {
  try {
    const token = await getTokenOrThrow()
    const res = await fetch(`${BASE}/whatsapp-sessions/${sessionId}/status`, {
      headers: makeHeaders(token),
      cache: 'no-store',
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      return { success: false, error: data.message ?? 'Failed to fetch status' }
    }
    return { success: true, status: data.data?.status ?? data.status }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ── UPDATE SESSION ────────────────────────────────────────────────────────────
export async function updateSession(
  sessionId: number,
  payload: UpdateSessionPayload
): Promise<{ success: boolean; session?: WasenderSession; error?: string }> {
  try {
    const token = await getTokenOrThrow()
    const res = await fetch(`${BASE}/whatsapp-sessions/${sessionId}`, {
      method: 'PUT',
      headers: makeHeaders(token),
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      return { success: false, error: data.message ?? 'Failed to update session' }
    }
    return { success: true, session: data.data }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ── DELETE SESSION ────────────────────────────────────────────────────────────
// If the deleted session was the active one in DB, clear those settings.
export async function deleteSession(
  sessionId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getTokenOrThrow()
    const res = await fetch(`${BASE}/whatsapp-sessions/${sessionId}`, {
      method: 'DELETE',
      headers: makeHeaders(token),
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      return { success: false, error: data.message ?? 'Failed to delete session' }
    }

    // Clear DB if this was the active session
    const storedId = await getSetting('wasender_session_id')
    if (storedId === String(sessionId)) {
      await saveSettings([
        { key: 'wasender_session_id', value: '' },
        { key: 'wasender_api_key', value: '' },
      ])
    }

    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ── RESTART SESSION ───────────────────────────────────────────────────────────
export async function restartSession(
  sessionId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getTokenOrThrow()
    const res = await fetch(`${BASE}/whatsapp-sessions/${sessionId}/restart`, {
      method: 'POST',
      headers: makeHeaders(token),
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      return { success: false, error: data.message ?? 'Failed to restart session' }
    }
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ── CONNECT SESSION (returns QR) ──────────────────────────────────────────────
export async function connectSession(
  sessionId: number
): Promise<{
  success: boolean
  status?: string
  qrString?: string
  error?: string
}> {
  try {
    const token = await getTokenOrThrow()
    const res = await fetch(`${BASE}/whatsapp-sessions/${sessionId}/connect`, {
      method: 'POST',
      headers: makeHeaders(token),
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      return { success: false, error: data.message ?? 'Failed to connect session' }
    }
    return {
      success: true,
      status: data.data?.status,
      qrString: data.data?.qrCode ?? null,
    }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ── DISCONNECT SESSION ────────────────────────────────────────────────────────
export async function disconnectSession(
  sessionId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const token = await getTokenOrThrow()
    const res = await fetch(`${BASE}/whatsapp-sessions/${sessionId}/disconnect`, {
      method: 'POST',
      headers: makeHeaders(token),
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      return { success: false, error: data.message ?? 'Failed to disconnect session' }
    }
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ── REFRESH QR ────────────────────────────────────────────────────────────────
export async function refreshSessionQR(
  sessionId: number
): Promise<{ success: boolean; qrString?: string; error?: string }> {
  try {
    const token = await getTokenOrThrow()
    const res = await fetch(`${BASE}/whatsapp-sessions/${sessionId}/qrcode`, {
      headers: makeHeaders(token),
      cache: 'no-store',
    })
    const data = await res.json()
    if (!res.ok || !data.success) {
      return { success: false, error: data.message ?? 'Failed to get QR' }
    }
    return { success: true, qrString: data.data?.qrCode }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ── SET ACTIVE SESSION ────────────────────────────────────────────────────────
// Saves session_id + api_key to app_settings so sendWhatsAppMessage uses it.
export async function setActiveSession(
  sessionId: number,
  apiKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify ADMIN before writing
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role !== 'ADMIN') return { success: false, error: 'Unauthorized' }

    await saveSettings([
      { key: 'wasender_session_id', value: String(sessionId) },
      { key: 'wasender_api_key', value: apiKey },
    ])

    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
