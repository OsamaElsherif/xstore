'use server'

import { createClient } from '@/lib/supabase/server'
import { Subcategory, Category, CategoryWithSubcategories, CategoryWithFullTree } from '@/types'
import { getCurrentProfile } from './auth'
import { revalidatePath } from 'next/cache'

// Get all subcategories for a specific category
export async function getSubcategoriesByCategory(
  categoryId: string
): Promise<Subcategory[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('subcategories')
    .select('*')
    .eq('category_id', categoryId)
    .order('name_en')

  if (error) {
    console.error('Error fetching subcategories:', error)
    return []
  }

  return data as Subcategory[]
}

// Get all categories with their subcategories nested
export async function getCategoriesWithSubcategories(): Promise<CategoryWithSubcategories[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*, subcategories(*)')
    .order('name_en')

  if (error) {
    console.error('Error fetching categories with subcategories:', error)
    return []
  }

  return data as CategoryWithSubcategories[]
}

// Get all categories with their nested subcategories and sub-subcategories
export async function getCategoriesWithFullTree(): Promise<CategoryWithFullTree[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*, subcategories(*, sub_subcategories(*))')
    .order('name_en')

  if (error) {
    console.error('Error fetching categories with full tree:', error)
    return []
  }

  // Ensure sub_subcategories are ordered by name_en within each subcategory, and subcategories within categories
  // Note: we can sort them in js/ts or let supabase handle it if needed. Let's make sure the type casting is clean.
  return data as any[]
}

// Get single subcategory by slug and parent category slug
export async function getSubcategoryBySlug(
  categorySlug: string,
  subcategorySlug: string
): Promise<(Subcategory & { categories: Category }) | null> {
  const supabase = await createClient()

  // First get the category by slug
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single()

  if (!category) return null

  const { data, error } = await supabase
    .from('subcategories')
    .select('*, categories!subcategories_category_id_fkey(*)')
    .eq('category_id', category.id)
    .eq('slug', subcategorySlug)
    .single()

  if (error) {
    console.error('Error fetching subcategory:', error)
    return null
  }

  return data as (Subcategory & { categories: Category })
}

// Create a new subcategory — ADMIN only
export async function createSubcategory(data: {
  category_id: string
  name_en: string
  name_ar: string
  slug: string
  image_url?: string | null
}): Promise<{ success: boolean; subcategory?: Subcategory; error?: string }> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  const supabase = await createClient()
  const { data: subcategory, error } = await supabase
    .from('subcategories')
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error('Error creating subcategory:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/categories')
  return { success: true, subcategory: subcategory as Subcategory }
}

// Update a subcategory — ADMIN only
export async function updateSubcategory(
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
    .from('subcategories')
    .update(data)
    .eq('id', id)

  if (error) {
    console.error('Error updating subcategory:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/categories')
  return { success: true }
}

// Delete a subcategory — ADMIN only
export async function deleteSubcategory(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  const supabase = await createClient()

  // Unassign all products in this subcategory first
  await supabase
    .from('products')
    .update({ subcategory_id: null })
    .eq('subcategory_id', id)

  // Then delete the subcategory
  const { error } = await supabase
    .from('subcategories')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting subcategory:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/categories')
  return { success: true }
}

// Assign existing products to a subcategory — ADMIN only
export async function assignProductsToSubcategory(
  subcategoryId: string,
  productIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  const supabase = await createClient()

  for (const productId of productIds) {
    const { error } = await supabase
      .from('products')
      .update({ subcategory_id: subcategoryId })
      .eq('id', productId)

    if (error) {
      console.error('Error assigning product:', error)
      return { success: false, error: error.message }
    }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/admin/products')
  return { success: true }
}

// Remove a product from its subcategory — ADMIN only
export async function removeProductFromSubcategory(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('products')
    .update({ subcategory_id: null })
    .eq('id', productId)

  if (error) {
    console.error('Error removing product from subcategory:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/admin/products')
  return { success: true }
}
