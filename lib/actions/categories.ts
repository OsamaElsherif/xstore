'use server'

import { createClient } from '@/lib/supabase/server'
import { Category } from '@/types'
import { getCurrentProfile } from './auth'
import { revalidatePath } from 'next/cache'

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name_en')
    
  if (error) {
    console.error('Error fetching categories:', error)
    return []
  }
  
  return data as Category[]
}

export async function createCategory(data: {
  name_en: string
  name_ar: string
  slug: string
  image_url?: string | null
}): Promise<{ success: boolean; error?: string; category?: Category }> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  const supabase = await createClient()
  const { data: category, error } = await supabase
    .from('categories')
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error('Error creating category:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/categories')
  return { success: true, category: category as Category }
}

export async function updateCategory(
  id: string,
  data: Partial<{
    name_en: string
    name_ar: string
    slug: string
    image_url: string | null
  }>
): Promise<{ success: boolean; error?: string }> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('categories')
    .update(data)
    .eq('id', id)

  if (error) {
    console.error('Error updating category:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/categories')
  return { success: true }
}

export async function deleteCategory(id: string): Promise<{ success: boolean; error?: string }> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  const supabase = await createClient()
  
  // Check if category has products
  const { count, error: countError } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', id)

  if (countError) {
    console.error('Error checking category products:', countError)
    return { success: false, error: countError.message }
  }

  if (count && count > 0) {
    return { success: false, error: `Cannot delete category with existing products. Reassign or delete ${count} products first.` }
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting category:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/categories')
  return { success: true }
}
