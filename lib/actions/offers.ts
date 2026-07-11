'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentProfile } from './auth'
import { revalidatePath } from 'next/cache'
import { Offer, OfferWithProducts } from '@/types'
import { TablesInsert } from '@/types/database.types'

type OfferInsert = TablesInsert<'offers'>

// ─── Admin Reads ───────────────────────────────────────────────────────────────

export async function getAllOffers(): Promise<OfferWithProducts[]> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'ADMIN') throw new Error('Unauthorized')

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('offers')
    .select('*, offer_products(*, products(*))')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching offers:', error)
    return []
  }

  return (data ?? []) as unknown as OfferWithProducts[]
}

export async function getOfferById(id: string): Promise<OfferWithProducts | null> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'ADMIN') throw new Error('Unauthorized')

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('offers')
    .select('*, offer_products(*, products(*))')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching offer:', error)
    return null
  }

  return data as unknown as OfferWithProducts
}

// ─── Public / Shop Reads ───────────────────────────────────────────────────────

/**
 * Given a list of product IDs, returns a map of productId → active Offer.
 * Active = is_active=true AND (start_date is null OR <= now) AND (end_date is null OR >= now).
 */
export async function getActiveOffersForProducts(
  productIds: string[]
): Promise<Map<string, Offer>> {
  if (productIds.length === 0) return new Map()

  const supabase = await createClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('offer_products')
    .select('product_id, offers!inner(*)')
    .in('product_id', productIds)
    .eq('offers.is_active', true)
    .or(`start_date.is.null,start_date.lte.${now}`, { referencedTable: 'offers' })
    .or(`end_date.is.null,end_date.gte.${now}`, { referencedTable: 'offers' })

  if (error) {
    console.error('Error fetching active offers for products:', error)
    return new Map()
  }

  const map = new Map<string, Offer>()
  for (const row of data ?? []) {
    const r = row as unknown as { product_id: string; offers: Offer }
    if (!map.has(r.product_id)) {
      map.set(r.product_id, r.offers)
    }
  }

  return map
}

/** Returns the single active offer for a product, or null if none. */
export async function getActiveOfferForProduct(productId: string): Promise<Offer | null> {
  const map = await getActiveOffersForProducts([productId])
  return map.get(productId) ?? null
}

// ─── CRUD ──────────────────────────────────────────────────────────────────────

export async function createOffer(
  data: Omit<OfferInsert, 'id' | 'created_at' | 'updated_at'>,
  productIds: string[]
): Promise<{ success: boolean; error?: string; offer?: Offer }> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'ADMIN') return { success: false, error: 'Unauthorized' }

  const supabase = await createClient()

  const { data: offer, error } = await supabase
    .from('offers')
    .insert({ ...data, updated_at: new Date().toISOString() })
    .select()
    .single()

  if (error) {
    console.error('Error creating offer:', error)
    return { success: false, error: error.message }
  }

  if (productIds.length > 0) {
    const links = productIds.map((pid) => ({ offer_id: offer.id, product_id: pid }))
    const { error: linkError } = await supabase.from('offer_products').insert(links)
    if (linkError) console.error('Error linking products to offer:', linkError)
  }

  revalidatePath('/admin/offers')
  return { success: true, offer: offer as Offer }
}

export async function updateOffer(
  id: string,
  data: Partial<Omit<OfferInsert, 'id' | 'created_at'>>,
  productIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'ADMIN') return { success: false, error: 'Unauthorized' }

  const supabase = await createClient()

  const { error } = await supabase
    .from('offers')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error updating offer:', error)
    return { success: false, error: error.message }
  }

  // Replace all product links atomically
  await supabase.from('offer_products').delete().eq('offer_id', id)
  if (productIds.length > 0) {
    const links = productIds.map((pid) => ({ offer_id: id, product_id: pid }))
    const { error: linkError } = await supabase.from('offer_products').insert(links)
    if (linkError) console.error('Error relinking products to offer:', linkError)
  }

  revalidatePath('/admin/offers')
  revalidatePath('/shop')
  return { success: true }
}

export async function deleteOffer(id: string): Promise<{ success: boolean; error?: string }> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'ADMIN') return { success: false, error: 'Unauthorized' }

  const supabase = await createClient()

  // Delete links first (in case no cascade constraint is set)
  await supabase.from('offer_products').delete().eq('offer_id', id)
  const { error } = await supabase.from('offers').delete().eq('id', id)

  if (error) {
    console.error('Error deleting offer:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/offers')
  return { success: true }
}

export async function toggleOfferActive(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'ADMIN') return { success: false, error: 'Unauthorized' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('offers')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) {
    console.error('Error toggling offer:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/offers')
  return { success: true }
}
