'use server'

import { getSettings } from '@/lib/actions/settings'
import { SettingsMap } from '@/types'

function resolveGreenApiCredentials(settings: Partial<SettingsMap>) {
  return {
    instanceId: settings.greenapi_instance_id!,
    apiToken: settings.greenapi_api_token!,
  }
}

// Get current instance connection state
// Returns: 'authorized' | 'notAuthorized' | 'sleepMode' | 'starting' | 'notConfigured' | 'error'
export async function getGreenApiState(): Promise<{
  state: string
  error?: string
}> {
  const settings = await getSettings([
    'greenapi_instance_id',
    'greenapi_api_token',
  ])

  if (!settings.greenapi_instance_id || !settings.greenapi_api_token) {
    return { state: 'notConfigured' }
  }

  try {
    const { instanceId, apiToken } = resolveGreenApiCredentials(settings)
    const res = await fetch(
      `https://api.green-api.com/waInstance${instanceId}/getStateInstance/${apiToken}`
    )
    const data = await res.json()
    return { state: data.stateInstance ?? 'unknown' }
  } catch (e: any) {
    return { state: 'error', error: e.message }
  }
}

// Get QR code for scanning — returns base64 image string
// Only works when state = 'notAuthorized'
export async function getGreenApiQR(): Promise<{
  success: boolean
  qrCode?: string   // base64 image data — render as <img src={qrCode} />
  message?: string  // 'alreadyLogged' if already connected
  error?: string
}> {
  const settings = await getSettings([
    'greenapi_instance_id',
    'greenapi_api_token',
  ])

  if (!settings.greenapi_instance_id || !settings.greenapi_api_token) {
    return { success: false, error: 'Green API credentials not configured' }
  }

  try {
    const { instanceId, apiToken } = resolveGreenApiCredentials(settings)
    const res = await fetch(
      `https://api.green-api.com/waInstance${instanceId}/qr/${apiToken}`
    )
    const data = await res.json()

    if (data.type === 'alreadyLogged') {
      return { success: true, message: 'alreadyLogged' }
    }
    if (data.type === 'qrCode') {
      return { success: true, qrCode: data.message } // base64 PNG
    }
    return { success: false, error: data.message ?? 'Unknown QR error' }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// Logout (disconnect) the WhatsApp instance
export async function logoutGreenApi(): Promise<{
  success: boolean
  error?: string
}> {
  const settings = await getSettings([
    'greenapi_instance_id',
    'greenapi_api_token',
  ])

  if (!settings.greenapi_instance_id || !settings.greenapi_api_token) {
    return { success: false, error: 'Green API credentials not configured' }
  }

  try {
    const { instanceId, apiToken } = resolveGreenApiCredentials(settings)
    const res = await fetch(
      `https://api.green-api.com/waInstance${instanceId}/logout/${apiToken}`,
      { method: 'GET' }
    )
    if (!res.ok) {
      const err = await res.json()
      return { success: false, error: err.message ?? 'Logout failed' }
    }
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// Send a test WhatsApp message — used by TemplatePreviewModal
export async function sendTestWhatsApp(
  phone: string,
  messageBody: string
): Promise<{ success: boolean; error?: string }> {
  const settings = await getSettings([
    'greenapi_instance_id',
    'greenapi_api_token',
  ])

  if (!settings.greenapi_instance_id || !settings.greenapi_api_token) {
    return { success: false, error: 'Green API credentials not configured' }
  }

  try {
    const { instanceId, apiToken } = resolveGreenApiCredentials(settings)
    const chatId = phone.replace(/[\s\-+]/g, '') + '@c.us'

    const res = await fetch(
      `https://api.green-api.com/waInstance${instanceId}/sendMessage/${apiToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId, message: messageBody }),
      }
    )

    if (!res.ok) {
      const err = await res.json()
      return { success: false, error: err.message ?? 'Send failed' }
    }
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
