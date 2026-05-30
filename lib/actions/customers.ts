'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp/sendWhatsApp'
import { getSetting } from '@/lib/actions/settings'

export type ResolvedCustomer = {
  user_id: string | null
  customer_name: string
  customer_phone: string
  customer_email: string | null
  isNewAccount: boolean
  temporaryPassword?: string
}

type CustomerPayload = {
  full_name: string
  phone: string
  email?: string
}

function generateTempPassword(): string {
  const random = Math.floor(1000 + Math.random() * 9000)
  return `Jacob-${random}-Store`
}

async function verifyCallerIsStaff() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['ADMIN', 'CASHIER'].includes(profile.role)) return null
  return user
}

export async function resolveOrCreateCustomer(
  data: CustomerPayload
): Promise<{ success: boolean; customer?: ResolvedCustomer; error?: string }> {
  // Step 1 — Verify caller is ADMIN or CASHIER
  const caller = await verifyCallerIsStaff()
  if (!caller) return { success: false, error: 'Unauthorized' }

  // Step 2 — No email → guest order, no account
  if (!data.email) {
    return {
      success: true,
      customer: {
        user_id: null,
        customer_name: data.full_name,
        customer_phone: data.phone,
        customer_email: null,
        isNewAccount: false,
      }
    }
  }

  // Step 3 — Email provided → check if user already exists
  const { data: { users: existingUsers } } = await supabaseAdmin.auth.admin.listUsers()
  const existingUser = existingUsers.find(u => u.email === data.email)

  if (existingUser) {
    return {
      success: true,
      customer: {
        user_id: existingUser.id,
        customer_name: data.full_name,
        customer_phone: data.phone,
        customer_email: data.email,
        isNewAccount: false,
      }
    }
  }

  // Step 4 — Create a new CUSTOMER account
  const temporaryPassword = generateTempPassword()

  const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: temporaryPassword,
    email_confirm: true,
    user_metadata: { full_name: data.full_name },
  })

  if (createError) return { success: false, error: createError.message }

  // Ensure full_name is set on the profile
  await supabaseAdmin
    .from('profiles')
    .update({ full_name: data.full_name })
    .eq('id', newUser.user.id)

  // Step 5 — Notify via WhatsApp if enabled
  const notifyCredentials = await getSetting('whatsapp_notify_credentials')
  if (notifyCredentials === 'true' && data.phone) {
    try {
      await sendWhatsAppMessage({
        to: data.phone,
        templateKey: 'whatsapp_template_credentials',
        parameters: [
          data.full_name,          // {{1}} Hi {name}
          data.email || '',        // {{2}} Email: {email}
          temporaryPassword,       // {{3}} Password: {Jacob-4829-Store}
        ],
      })
    } catch (waError) {
      console.error('Credentials WhatsApp notification failed:', waError)
    }
  }

  return {
    success: true,
    customer: {
      user_id: newUser.user.id,
      customer_name: data.full_name,
      customer_phone: data.phone,
      customer_email: data.email,
      isNewAccount: true,
      temporaryPassword,
    }
  }
}

// Lightweight check — just tells us if email exists. Does NOT create anything.
export async function checkCustomerExists(
  email: string
): Promise<{ exists: boolean; full_name?: string }> {
  const caller = await verifyCallerIsStaff()
  if (!caller) return { exists: false }

  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
  const found = users.find(u => u.email === email)

  if (found) {
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', found.id)
      .single()

    return { exists: true, full_name: profile?.full_name ?? undefined }
  }

  return { exists: false }
}
