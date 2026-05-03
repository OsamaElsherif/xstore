'use server'

import { createClient } from '@/lib/supabase/server'
import { MaintenanceRequest, MaintenanceStatus } from '@/types'
import { getCurrentProfile } from './auth'
import { revalidatePath } from 'next/cache'

// Submit a new maintenance request (public)
export async function submitMaintenanceRequest(data: {
  customer_name: string
  customer_phone: string
  customer_email?: string
  device_type: string
  device_brand: string
  issue_description: string
  user_id?: string
}): Promise<{ success: boolean; request?: MaintenanceRequest; error?: string }> {
  const supabase = await createClient()

  const { data: request, error } = await supabase
    .from('maintenance_requests')
    .insert({
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      customer_email: data.customer_email,
      device_type: data.device_type,
      device_brand: data.device_brand,
      issue_description: data.issue_description,
      user_id: data.user_id,
      status: 'PENDING',
      payment_status: 'UNPAID'
    })
    .select()
    .single()

  if (error) {
    console.error('Error submitting maintenance request:', error)
    return { success: false, error: error.message }
  }

  return { success: true, request: request as MaintenanceRequest }
}

// Get all maintenance requests — staff only
export async function getAllMaintenanceRequests(): Promise<MaintenanceRequest[]> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role === 'CUSTOMER') {
    throw new Error('Unauthorized')
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select('*')
    .order('submitted_at', { ascending: false })

  if (error) {
    console.error('Error fetching maintenance requests:', error)
    return []
  }

  return data as MaintenanceRequest[]
}

// Get single request by request_number — for customer tracking (no auth needed)
export async function getMaintenanceRequestByNumber(
  requestNumber: string
): Promise<MaintenanceRequest | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('maintenance_requests')
    .select('id, request_number, customer_name, customer_phone, device_type, device_brand, issue_description, estimated_cost, actual_cost, status, payment_status, assigned_to, customer_notes, submitted_at, updated_at, completed_at')
    .eq('request_number', requestNumber)
    .single()

  if (error) {
    console.error('Error fetching maintenance request:', error)
    return null
  }

  return data as MaintenanceRequest
}

// Update maintenance status — ORDER_RECEIVER and ADMIN
export async function updateMaintenanceStatus(
  id: string,
  status: MaintenanceStatus
): Promise<{ success: boolean; error?: string }> {
  const profile = await getCurrentProfile()
  if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'ORDER_RECEIVER')) {
    return { success: false, error: 'Unauthorized' }
  }

  const supabase = await createClient()
  const updates: any = { status }
  
  if (status === 'DONE') {
    updates.completed_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('maintenance_requests')
    .update(updates)
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/admin/maintenance')
  return { success: true }
}

// Update estimated/actual cost — ADMIN only
export async function updateMaintenanceCost(
  id: string,
  data: { estimated_cost?: number; actual_cost?: number }
): Promise<{ success: boolean; error?: string }> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('maintenance_requests')
    .update(data)
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/admin/maintenance')
  return { success: true }
}

// Update notes and assignment — staff roles
export async function updateMaintenanceDetails(
  id: string,
  data: {
    admin_notes?: string
    customer_notes?: string
    assigned_to?: string
  }
): Promise<{ success: boolean; error?: string }> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role === 'CUSTOMER') {
    return { success: false, error: 'Unauthorized' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('maintenance_requests')
    .update(data)
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/admin/maintenance')
  return { success: true }
}

// Update payment status — CASHIER and ADMIN
export async function updateMaintenancePayment(
  id: string,
  payment_status: 'PAID' | 'UNPAID'
): Promise<{ success: boolean; error?: string }> {
  const profile = await getCurrentProfile()
  if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'CASHIER')) {
    return { success: false, error: 'Unauthorized' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('maintenance_requests')
    .update({ payment_status })
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  
  revalidatePath('/admin/maintenance')
  return { success: true }
}
