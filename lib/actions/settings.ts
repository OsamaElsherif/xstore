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

// Save multiple settings at once — ADMIN only
export async function saveSettings(
  settings: { key: keyof SettingsMap; value: string }[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // Verify ADMIN
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Check role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('app_settings')
    .upsert(
      settings.map(s => ({
        key: s.key,
        value: s.value,
        updated_by: user.id,
      })),
      { onConflict: 'key' }
    )

  if (error) return { success: false, error: error.message }
  return { success: true }
}


export async function testMetaConnection(): Promise<{
  success: boolean
  accountName?: string
  error?: string
}> {
  const settings = await getSettings([
    'meta_access_token',
    'meta_ad_account_id',
  ])

  if (!settings.meta_access_token || !settings.meta_ad_account_id) {
    return { success: false, error: 'Meta credentials not configured' }
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${settings.meta_ad_account_id}?fields=name&access_token=${settings.meta_access_token}`
    )
    const data = await response.json()
    if (data.error) return { success: false, error: data.error.message }
    return { success: true, accountName: data.name }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
