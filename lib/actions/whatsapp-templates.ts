'use server'

import { createClient } from '@/lib/supabase/server'
import { WhatsAppTemplate, EventKey } from '@/types'

const SYSTEM_EVENT_KEYS: EventKey[] = [
  'order_placed',
  'maintenance_received',
  'maintenance_status_update',
  'account_created',
]

// Get all templates — for admin management page
export async function getAllTemplates(): Promise<WhatsAppTemplate[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('whatsapp_templates')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Failed to fetch templates:', error)
    return []
  }
  return data as WhatsAppTemplate[]
}

// Get a single template by event key — used when sending messages
export async function getTemplateByEvent(
  eventKey: EventKey
): Promise<WhatsAppTemplate | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('whatsapp_templates')
    .select('*')
    .eq('event_key', eventKey)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error(`Failed to fetch template for event "${eventKey}":`, error)
    return null
  }
  return data as WhatsAppTemplate
}

// Create a new template — ADMIN only
export async function createTemplate(data: {
  name: string
  event_key: string
  body_ar: string
  body_en: string
  variables: string[]
}): Promise<{ success: boolean; template?: WhatsAppTemplate; error?: string }> {
  const supabase = await createClient()

  // Verify ADMIN
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  const { data: template, error } = await supabase
    .from('whatsapp_templates')
    .insert({
      name: data.name,
      event_key: data.event_key,
      body_ar: data.body_ar,
      body_en: data.body_en,
      variables: data.variables,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }
  return { success: true, template: template as WhatsAppTemplate }
}

// Update a template — ADMIN only
export async function updateTemplate(
  id: string,
  data: Partial<{
    name: string
    body_ar: string
    body_en: string
    variables: string[]
    is_active: boolean
  }>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('whatsapp_templates')
    .update(data)
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

// Delete a template — ADMIN only
// Blocks deletion if event_key is one of the 4 system keys
export async function deleteTemplate(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  // Fetch the template to check event_key
  const { data: template } = await supabase
    .from('whatsapp_templates')
    .select('event_key')
    .eq('id', id)
    .single()

  if (template && SYSTEM_EVENT_KEYS.includes(template.event_key as EventKey)) {
    return {
      success: false,
      error: 'System templates cannot be deleted. You can edit the body text or disable them instead.',
    }
  }

  const { error } = await supabase
    .from('whatsapp_templates')
    .delete()
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  return { success: true }
}
