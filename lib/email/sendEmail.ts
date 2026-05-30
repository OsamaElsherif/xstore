"use server"

import { resend } from './resend'
import { OrderConfirmation } from './templates/OrderConfirmation'
import { MaintenanceConfirmation } from './templates/MaintenanceConfirmation'
import { MaintenanceStatusUpdate } from './templates/MaintenanceStatusUpdate'
import { MaintenanceStatus } from '@/types'

export async function sendOrderConfirmationEmail(data: {
  to: string
  customerName: string
  orderNumber: string
  items: { name: string; quantity: number; price: number }[]
  totalPrice: number
  shippingAddress: string
  city: string
}): Promise<void> {
  const trackingUrl =
    `${process.env.NEXT_PUBLIC_SITE_URL}/track?type=order&ref=${data.orderNumber}`

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: data.to,
    subject: `Order Confirmed — ${data.orderNumber} | Jacob Store`,
    react: OrderConfirmation({ ...data, trackingUrl }),
  })
}

export async function sendMaintenanceConfirmationEmail(data: {
  to: string
  customerName: string
  requestNumber: string
  deviceBrand: string
  deviceType: string
  issueDescription: string
}): Promise<void> {
  const trackingUrl =
    `${process.env.NEXT_PUBLIC_SITE_URL}/track?type=maintenance&ref=${data.requestNumber}`

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: data.to,
    subject: `Repair Request Received — ${data.requestNumber} | Jacob Store`,
    react: MaintenanceConfirmation({ ...data, trackingUrl }),
  })
}

export async function sendMaintenanceStatusUpdateEmail(data: {
  to: string
  customerName: string
  requestNumber: string
  newStatus: MaintenanceStatus
  customerNotes: string | null
  estimatedCost: number | null
  actualCost: number | null
}): Promise<void> {
  const trackingUrl =
    `${process.env.NEXT_PUBLIC_SITE_URL}/track?type=maintenance&ref=${data.requestNumber}`

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: data.to,
    subject: `Repair Update: ${data.requestNumber} | Jacob Store`,
    react: MaintenanceStatusUpdate({ ...data, trackingUrl }),
  })
}
