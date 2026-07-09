'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Profile, UserRole } from '@/types'
import { getCurrentProfile } from './auth'
import { revalidatePath } from 'next/cache'


// Get all staff accounts — ADMIN only
export async function getAllStaffAccounts(): Promise<Profile[]> {
  const profile = await getCurrentProfile()
  const supabase = await createClient()
  if (!profile || profile.role !== 'ADMIN') throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .neq('role', 'CUSTOMER')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Profile[]
}

// Get ALL users including customers — ADMIN only
export async function getAllUsers(): Promise<Profile[]> {
  const profile = await getCurrentProfile()
  const supabase = await createClient()
  if (!profile || profile.role !== 'ADMIN') throw new Error('Unauthorized')

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Profile[]
}

// Create a new staff account — ADMIN only
export async function createStaffAccount(data: {
  full_name: string
  email: string
  password: string
  role: Exclude<UserRole, 'CUSTOMER'>
}): Promise<{ success: boolean; error?: string }> {
  const adminProfile = await getCurrentProfile()
  const supabase = await createClient()
  if (!adminProfile || adminProfile.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  // 1. Create the user in Auth
  const { data: userData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password: data.password,
    email_confirm: true,
    user_metadata: { full_name: data.full_name }
  })

  if (authError) return { success: false, error: authError.message }

  // 2. Update the profile role (handle_new_user trigger already created the profile)
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      role: data.role,
      full_name: data.full_name // Ensure name is set if trigger missed it or metadata changed
    })
    .eq('id', userData.user.id)

  if (profileError) return { success: false, error: profileError.message }


  revalidatePath('/admin/users')
  return { success: true }
}

// Update a user's role — ADMIN only
export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<{ success: boolean; error?: string }> {
  const adminProfile = await getCurrentProfile()
  const supabase = await createClient()
  if (!adminProfile || adminProfile.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  if (userId === adminProfile.id) {
    return { success: false, error: 'Cannot change your own role' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/users')
  return { success: true }
}

// Deactivate a user account — ADMIN only
export async function deactivateStaffAccount(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const adminProfile = await getCurrentProfile()
  const supabase = await createClient()
  if (!adminProfile || adminProfile.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  if (userId === adminProfile.id) {
    return { success: false, error: 'Cannot deactivate your own account' }
  }

  // 1. Ban the user in Auth
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { ban_duration: '87600h' } // ~10 years
  )

  if (authError) return { success: false, error: authError.message }

  // 2. Demote to CUSTOMER just in case they manage to bypass ban
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'CUSTOMER' })
    .eq('id', userId)

  if (profileError) return { success: false, error: profileError.message }

  revalidatePath('/admin/users')
  return { success: true }
}

// Reset a user's password — ADMIN only
export async function resetUserPassword(
  userId: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const adminProfile = await getCurrentProfile()
  const supabase = await createClient()
  if (!adminProfile || adminProfile.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(
    userId,
    { password: newPassword }
  )

  if (error) return { success: false, error: error.message }

  return { success: true }
}
