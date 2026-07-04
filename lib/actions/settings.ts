'use server'

import { createClient } from '@/lib/supabase/client'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { SettingsMap, AppSetting } from '@/types'

// Get a single setting value by key
export async function getSetting(
  key: keyof SettingsMap
): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .single()
  return data?.value ?? null
}

// Get multiple settings at once — returns a partial map
export async function getSettings(
  keys: (keyof SettingsMap)[]
): Promise<Partial<SettingsMap>> {
  const { data, error } = await supabaseAdmin
    .from('app_settings')
    .select('key, value')
    .in('key', keys)

  if (error) {
    console.error('Error fetching settings:', error.message)
    return {}
  }

  const map: Partial<SettingsMap> = {}
  data?.forEach(row => {
    map[row.key as keyof SettingsMap] = row.value ?? ''
  })
  return map
}

// Get ALL settings — ADMIN only
export async function getAllSettings(): Promise<AppSetting[]> {
  const { data, error } = await supabaseAdmin
    .from('app_settings')
    .select('*')
    .order('key')

  if (error) {
    console.error('Error fetching all settings:', error.message)
    return []
  }
  return data ?? []
}

export async function saveSettings(
  settings: { key: keyof SettingsMap; value: string }[]
): Promise<{ success: boolean; error?: string }> {

  // ✅ Use supabaseAdmin only for the actual DB write — bypasses RLS
  const { error } = await supabaseAdmin
    .from('app_settings')
    .upsert(
      settings.map(s => ({
        key: s.key,
        value: s.value,
      })),
      { onConflict: 'key' }
    )

  if (error) return { success: false, error: error.message }
  return { success: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// Wasender API — Fully Automated Session Management
// Admin enters ONLY the Personal Access Token once.
// Session ID + API Key are auto-saved from the create session response.
// ─────────────────────────────────────────────────────────────────────────────

const WASENDER_BASE = 'https://www.wasenderapi.com/api'

// Internal helper — fetch all three Wasender credentials at once
async function getWasenderCreds() {
  return getSettings([
    'wasender_personal_access_token',
    'wasender_session_id',
    'wasender_api_key',
  ])
}

// ─── STEP 1 ───────────────────────────────────────────────────────────────────
// Create a new session using only the personal access token.
// Auto-saves the returned session id + api_key to app_settings.
// Called ONCE when the admin sets up for the first time.
export async function createWasenderSession(data: {
  sessionName: string   // e.g. "Jacob Store WhatsApp"
  phoneNumber: string   // e.g. "+201012345678"
}): Promise<{ success: boolean; sessionId?: number; error?: string }> {
  const settings = await getSettings(['wasender_personal_access_token'])
  const token = settings.wasender_personal_access_token

  if (!token) return { success: false, error: 'Personal Access Token not configured' }

  try {
    const res = await fetch(`${WASENDER_BASE}/whatsapp-sessions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.sessionName,
        phone_number: data.phoneNumber,
        account_protection: true,
        log_messages: true,
        read_incoming_messages: false,
      }),
    })

    const result = await res.json()
    if (!res.ok || !result.success) {
      return { success: false, error: result.message ?? 'Failed to create session' }
    }

    const sessionId = result.data.id
    const apiKey = result.data.api_key

    // Auto-save both — admin never needs to touch these
    await saveSettings([
      { key: 'wasender_session_id', value: String(sessionId) },
      { key: 'wasender_api_key', value: apiKey },
    ])

    return { success: true, sessionId }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ─── STEP 2 ───────────────────────────────────────────────────────────────────
// Connect the session — returns QR string directly from the connect response.
// Call after createWasenderSession(), or to reconnect after a disconnect.
export async function connectWasenderSession(): Promise<{
  success: boolean
  status?: string       // 'NEED_SCAN' | 'ALREADY_INITIALIZED' | etc.
  qrString?: string     // present when status === 'NEED_SCAN'
  error?: string
}> {
  const settings = await getWasenderCreds()
  const token = settings.wasender_personal_access_token
  const sessionId = settings.wasender_session_id

  if (!token || !sessionId) {
    return { success: false, error: 'Session not created yet' }
  }

  try {
    const res = await fetch(
      `${WASENDER_BASE}/whatsapp-sessions/${sessionId}/connect`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    const result = await res.json()
    if (!res.ok || !result.success) {
      return { success: false, error: result.message ?? 'Failed to connect session' }
    }

    return {
      success: true,
      status: result.data.status,
      qrString: result.data.qrCode ?? null,
    }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ─── STEP 3 (refresh) ─────────────────────────────────────────────────────────
// Fetch a fresh QR code — QR expires every 45 seconds.
export async function getWasenderQR(): Promise<{
  success: boolean
  qrString?: string
  error?: string
}> {
  const settings = await getWasenderCreds()
  const token = settings.wasender_personal_access_token
  const sessionId = settings.wasender_session_id

  if (!token || !sessionId) {
    return { success: false, error: 'Session not configured' }
  }

  try {
    const res = await fetch(
      `${WASENDER_BASE}/whatsapp-sessions/${sessionId}/qrcode`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    const result = await res.json()
    if (!res.ok || !result.success) {
      return { success: false, error: result.message ?? 'Failed to get QR' }
    }

    return { success: true, qrString: result.data.qrCode }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ─── Get status ───────────────────────────────────────────────────────────────
// Status values: connecting, connected, disconnected, need_scan, logged_out
export async function getWasenderStatus(): Promise<{
  status: string
  error?: string
}> {
  const settings = await getWasenderCreds()
  const token = settings.wasender_personal_access_token
  const sessionId = settings.wasender_session_id

  if (!token) return { status: 'notConfigured' }
  if (!sessionId) return { status: 'noSession' }

  try {
    const res = await fetch(
      `${WASENDER_BASE}/whatsapp-sessions/${sessionId}/status`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
    const result = await res.json()
    return { status: result.data?.status ?? result.status ?? 'unknown' }
  } catch (e: any) {
    return { status: 'error', error: e.message }
  }
}

// ─── Disconnect ───────────────────────────────────────────────────────────────
export async function disconnectWasenderSession(): Promise<{
  success: boolean
  error?: string
}> {
  const settings = await getWasenderCreds()
  const token = settings.wasender_personal_access_token
  const sessionId = settings.wasender_session_id

  if (!token || !sessionId) return { success: false, error: 'Not configured' }

  try {
    const res = await fetch(
      `${WASENDER_BASE}/whatsapp-sessions/${sessionId}/disconnect`,
      { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
    )
    const result = await res.json()
    if (!res.ok || !result.success) {
      return { success: false, error: result.message ?? 'Failed to disconnect' }
    }
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ─── Account info ─────────────────────────────────────────────────────────────
export async function getWasenderAccountInfo(): Promise<{ phoneNumber: string | null }> {
  const settings = await getWasenderCreds()
  if (!settings.wasender_api_key) return { phoneNumber: null }

  try {
    const res = await fetch(`${WASENDER_BASE}/get-session-info`, {
      headers: { Authorization: `Bearer ${settings.wasender_api_key}` },
    })
    const data = await res.json()
    return {
      phoneNumber:
        data.data?.phone ??
        data.data?.jid?.replace('@s.whatsapp.net', '') ??
        null,
    }
  } catch {
    return { phoneNumber: null }
  }
}

// ─── Test message ─────────────────────────────────────────────────────────────
export async function testWasenderConnection(
  testPhone: string
): Promise<{ success: boolean; error?: string }> {
  const settings = await getWasenderCreds()
  if (!settings.wasender_api_key) {
    return { success: false, error: 'Session not connected yet' }
  }

  let phone = testPhone.replace(/[\s\-]/g, '')
  if (!phone.startsWith('+')) phone = `+${phone}`

  try {
    const res = await fetch(`${WASENDER_BASE}/send-message`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${settings.wasender_api_key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: phone,
        text: '✅ Test message from Jacob Store admin.',
      }),
    })
    const result = await res.json()
    if (!res.ok || !result.success) {
      return { success: false, error: result.message ?? 'Test failed' }
    }
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
