'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { toE164Egypt } from '@/lib/utils/phone'
import { sendWhatsAppMessage } from '@/lib/whatsapp/sendWhatsApp'

// Update WhatsApp opt-in preference (called from account settings)
export async function updateWhatsappOptIn(data: {
  whatsapp_opted_in: boolean
  whatsapp_phone: string | null
}): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const phone = data.whatsapp_phone
    ? toE164Egypt(data.whatsapp_phone)
    : null

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      whatsapp_opted_in: data.whatsapp_opted_in,
      whatsapp_phone: phone,
    })
    .eq('id', user.id)

  if (error) return { success: false, error: error.message }

  // If they just opted in for the first time, send the welcome message
  // to establish the conversation
  if (data.whatsapp_opted_in && phone) {
    const { data: profile } = await supabase
      .from('profiles').select('full_name').eq('id', user.id).single()
    try {
      await sendWhatsAppMessage({
        to: phone,
        eventKey: 'whatsapp_optin',
        variables: [profile?.full_name ?? 'Customer'],
      })
    } catch (e) {
      console.error('Opt-in WhatsApp failed:', e)
    }
  }

  return { success: true }
}

// Check if a user has opted in — used before sending any WhatsApp message
export async function getUserWhatsappPreference(
  userId: string
): Promise<{ opted_in: boolean; phone: string | null }> {
  const { data } = await supabaseAdmin
    .from('profiles')
    .select('whatsapp_opted_in, whatsapp_phone')
    .eq('id', userId)
    .single()

  return {
    opted_in: data?.whatsapp_opted_in ?? false,
    phone: data?.whatsapp_phone ?? null,
  }
}
