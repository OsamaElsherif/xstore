'use server'

import { createClient } from '@/lib/supabase/server'
import { MaintenanceRequest, MaintenanceStatus } from '@/types'
import { getCurrentProfile } from './auth'
import { revalidatePath } from 'next/cache'
import { sendMaintenanceConfirmationEmail, sendMaintenanceStatusUpdateEmail } from '@/lib/email/sendEmail'
import { sendWhatsAppMessage } from '@/lib/whatsapp/sendWhatsApp'
import { getSetting } from '@/lib/actions/settings'
import { getUserWhatsappPreference } from '@/lib/actions/profile'

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

  // Send maintenance confirmation email
  if (data.customer_email) {
    try {
      await sendMaintenanceConfirmationEmail({
        to: data.customer_email,
        customerName: data.customer_name,
        requestNumber: (request as MaintenanceRequest).request_number ?? '',
        deviceBrand: data.device_brand,
        deviceType: data.device_type,
        issueDescription: data.issue_description,
      })
    } catch (emailError) {
      console.error('Maintenance confirmation email failed:', emailError)
    }
  }

  // Send WhatsApp notification
  const notifyMaintenance = await getSetting('whatsapp_notify_maintenance')
  if (notifyMaintenance === 'true') {
    if (data.user_id) {
      try {
        const pref = await getUserWhatsappPreference(data.user_id)
        if (pref.opted_in && pref.phone) {
          await sendWhatsAppMessage({
            to: pref.phone,
            eventKey: 'maintenance_received',
            variables: [
              data.customer_name,
              request.request_number ?? '',
              data.device_brand,
              data.device_type,
            ],
          })
        }
      } catch (waError) {
        console.error('Maintenance WhatsApp notification failed:', waError)
      }
    }
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

  // Status trigger logic
  const emailTriggerStatuses: MaintenanceStatus[] = ['IN_PROGRESS', 'WAITING_PARTS', 'DONE', 'CANCELLED']

  if (emailTriggerStatuses.includes(status)) {
    const { data: request } = await supabase
      .from('maintenance_requests')
      .select('user_id, customer_email, customer_phone, customer_name, request_number, customer_notes, estimated_cost, actual_cost')
      .eq('id', id)
      .single()

    if (request) {
      // 1. Send Email
      if (request.customer_email) {
        try {
          await sendMaintenanceStatusUpdateEmail({
            to: request.customer_email,
            customerName: request.customer_name,
            requestNumber: request.request_number ?? '',
            newStatus: status,
            customerNotes: request.customer_notes,
            estimatedCost: request.estimated_cost,
            actualCost: request.actual_cost,
          })
        } catch (emailError) {
          console.error('Status update email failed:', emailError)
        }
      }

      // 2. Send WhatsApp
      const notifyStatus = await getSetting('whatsapp_notify_status_update')
      if (notifyStatus === 'true') {
        if (request.user_id) {
          try {
            const pref = await getUserWhatsappPreference(request.user_id)
            if (pref.opted_in && pref.phone) {
              const statusLabels: Record<string, string> = {
                IN_PROGRESS:   'قيد الإصلاح / In Progress',
                WAITING_PARTS: 'في انتظار القطع / Waiting for Parts',
                DONE:          'جاهز للاستلام ✅ / Ready for Pickup',
                CANCELLED:     'تم الإلغاء ❌ / Cancelled',
              }

              await sendWhatsAppMessage({
                to: pref.phone,
                eventKey: 'maintenance_status_update',
                variables: [
                  request.customer_name,
                  request.request_number ?? '',
                  statusLabels[status] ?? status,
                  request.customer_notes ?? '',
                ],
              })
            }
          } catch (waError) {
            console.error('Maintenance status WhatsApp notification failed:', waError)
          }
        }
      }
    }
  }

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

export async function createMaintenanceOnBehalf(data: {
  customer_full_name: string
  customer_phone: string
  customer_email?: string
  device_brand: string
  device_type: string
  issue_description: string
  estimated_cost?: number
  assigned_to?: string
  admin_notes?: string
  initial_status?: MaintenanceStatus
}): Promise<{
  success: boolean
  request?: MaintenanceRequest
  newAccountCreated?: boolean
  temporaryPassword?: string
  error?: string
}> {
  // 1. Verify caller is ADMIN or CASHIER
  const callerProfile = await getCurrentProfile()
  if (!callerProfile || !['ADMIN', 'CASHIER', 'ORDER_RECEIVER'].includes(callerProfile.role)) {
    return { success: false, error: 'Unauthorized' }
  }

  // 2. Resolve or create the customer
  const { resolveOrCreateCustomer } = await import('@/lib/actions/customers')
  const customerResult = await resolveOrCreateCustomer({
    full_name: data.customer_full_name,
    phone: data.customer_phone,
    email: data.customer_email,
  })

  if (!customerResult.success || !customerResult.customer) {
    return { success: false, error: customerResult.error ?? 'Failed to resolve customer' }
  }

  const customer = customerResult.customer
  const supabase = await createClient()

  // 3. Insert into maintenance_requests
  const { data: request, error: insertError } = await supabase
    .from('maintenance_requests')
    .insert({
      customer_name: customer.customer_name,
      customer_phone: customer.customer_phone,
      customer_email: customer.customer_email,
      device_brand: data.device_brand,
      device_type: data.device_type,
      issue_description: data.issue_description,
      user_id: customer.user_id,
      status: data.initial_status ?? 'PENDING',
      payment_status: 'UNPAID',
      estimated_cost: data.estimated_cost,
      assigned_to: data.assigned_to,
      admin_notes: data.admin_notes
    })
    .select()
    .single()

  if (insertError) return { success: false, error: insertError.message }

  // 4. Send maintenance confirmation email if customer_email exists
  if (customer.customer_email) {
    try {
      await sendMaintenanceConfirmationEmail({
        to: customer.customer_email,
        customerName: customer.customer_name,
        requestNumber: (request as MaintenanceRequest).request_number ?? '',
        deviceBrand: data.device_brand,
        deviceType: data.device_type,
        issueDescription: data.issue_description,
      })
    } catch (emailError) {
      console.error('Maintenance confirmation email failed:', emailError)
    }
  }

  // 5. Send WhatsApp notification
  const notifyMaintenance = await getSetting('whatsapp_notify_maintenance')
  if (notifyMaintenance === 'true' && customer.customer_phone) {
    try {
      await sendWhatsAppMessage({
        to: customer.customer_phone,
        eventKey: 'maintenance_received',
        variables: [
          customer.customer_name,
          (request as MaintenanceRequest).request_number ?? '',
          data.device_brand,
          data.device_type,
        ],
      })
    } catch (waError) {
      console.error('Maintenance WhatsApp notification failed:', waError)
    }
  }

  revalidatePath('/admin/maintenance')
  return {
    success: true,
    request: request as MaintenanceRequest,
    newAccountCreated: customer.isNewAccount,
    temporaryPassword: customer.temporaryPassword
  }
}
