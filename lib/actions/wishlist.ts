'use server'

import { createClient } from '@/lib/supabase/server'
import { WishlistWithProduct } from '@/types'
import { revalidatePath } from 'next/cache'

export async function getWishlist(): Promise<WishlistWithProduct[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data, error } = await supabase
    .from('wishlists')
    .select('*, products(*)')
    .eq('user_id', user.id)

  if (error) {
    console.error('Error fetching wishlist:', error)
    return []
  }

  return data as WishlistWithProduct[]
}

export async function addToWishlist(productId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'User not logged in' }

  const { error } = await supabase
    .from('wishlists')
    .insert({ user_id: user.id, product_id: productId })

  if (error) {
    // If it's a duplicate key error, we can ignore it
    if (error.code === '23505') return { success: true }
    console.error('Error adding to wishlist:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/wishlist')
  return { success: true }
}

export async function removeFromWishlist(productId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'User not logged in' }

  const { error } = await supabase
    .from('wishlists')
    .delete()
    .eq('user_id', user.id)
    .eq('product_id', productId)

  if (error) {
    console.error('Error removing from wishlist:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/wishlist')
  return { success: true }
}

export async function isInWishlist(productId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return false

  const { data, error } = await supabase
    .from('wishlists')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single()

  return !!data
}
