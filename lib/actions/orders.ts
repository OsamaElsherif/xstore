'use server'

import { createClient } from '@/lib/supabase/server'
import { Order, OrderStatus, PaymentStatus, OrderWithItems, OrderItem } from '@/types'
import { revalidatePath } from 'next/cache'
import { getCurrentProfile } from "@/lib/actions/auth"

export type OrderInsertPayload = {
  customer_name: string
  customer_phone: string
  customer_email?: string
  shipping_address?: string
  city?: string
  notes?: string
  total_price: number
  user_id?: string
  items: { product_id: string; snapshot_name: string; snapshot_price: number; quantity: number }[]
}

export async function createOrder(data: OrderInsertPayload): Promise<{ success: boolean; order?: Order; errors?: string[] }> {
  const supabase = await createClient()
  
  // 1. Validate stock for all physical items
  const stockErrors: string[] = []

  for (const item of data.items) {
    const { data: product } = await supabase
      .from('products')
      .select('name_en, stock_quantity, is_service')
      .eq('id', item.product_id)
      .single()

    if (!product) {
      stockErrors.push(`Product not found: ${item.snapshot_name}`)
      continue
    }

    if (!product.is_service && (product.stock_quantity ?? 0) < item.quantity) {
      stockErrors.push(
        `"${product.name_en}" only has ${product.stock_quantity} units in stock.`
      )
    }
  }

  if (stockErrors.length > 0) {
    return { success: false, errors: stockErrors }
  }

  // 2. Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      customer_email: data.customer_email,
      shipping_address: data.shipping_address,
      city: data.city,
      notes: data.notes,
      total_price: data.total_price,
      user_id: data.user_id,
      order_number: `#${Math.floor(1000 + Math.random() * 9000)}`,
    })
    .select()
    .single()
    
  if (orderError) return { success: false, errors: [orderError.message] }
  
  // 3. Create order items (trigger handles stock decrement automatically)
  const orderItems = data.items.map(item => ({
    order_id: order.id,
    product_id: item.product_id,
    snapshot_name: item.snapshot_name,
    snapshot_price: item.snapshot_price,
    quantity: item.quantity
  }))
  
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)
    
  if (itemsError) return { success: false, errors: [itemsError.message] }
  
  revalidatePath('/admin')
  return { success: true, order: order as Order }
}

// No auth required — anyone with the order number can track
export async function getOrderByNumber(
  orderNumber: string
): Promise<(Order & { order_items: OrderItem[] }) | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('order_number', orderNumber)
    .single()

  if (error) {
    console.error('Error fetching order by number:', error)
    return null
  }

  return data as (Order & { order_items: OrderItem[] })
}

export async function getAllOrders(): Promise<OrderWithItems[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*))')
    .order('order_date', { ascending: false })
    
  if (error) {
    console.error('Error fetching orders:', error)
    return []
  }
  
  return data as OrderWithItems[]
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<{ success: boolean; error?: string }> {
  const profile = await getCurrentProfile()
  if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'ORDER_RECEIVER')) {
    return { success: false, error: 'Unauthorized' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function updatePaymentStatus(orderId: string, payment_status: PaymentStatus): Promise<{ success: boolean; error?: string }> {
  const profile = await getCurrentProfile()
  if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'CASHIER')) {
    return { success: false, error: 'Unauthorized' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('orders')
    .update({ payment_status })
    .eq('id', orderId)
    
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function updateDeliveryDate(orderId: string, deliveryDate: string | null): Promise<{ success: boolean; error?: string }> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('orders')
    .update({ delivery_date: deliveryDate })
    .eq('id', orderId)
    
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function updateOrderNotes(orderId: string, notes: string): Promise<{ success: boolean; error?: string }> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role === 'CUSTOMER') {
    return { success: false, error: 'Unauthorized' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('orders')
    .update({ notes })
    .eq('id', orderId)
    
  if (error) return { success: false, error: error.message }
  revalidatePath('/admin')
  return { success: true }
}
