'use server'

import { createClient } from '@/lib/supabase/server'
import { SubSubcategory, Subcategory, Category } from '@/types'
import { getCurrentProfile } from './auth'
import { revalidatePath } from 'next/cache'

// Get all sub-subcategories for a specific subcategory
export async function getSubSubcategoriesBySubcategory(
  subcategoryId: string
): Promise<SubSubcategory[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sub_subcategories')
    .select('*')
    .eq('subcategory_id', subcategoryId)
    .order('name_en')

  if (error) {
    console.error('Error fetching sub-subcategories:', error)
    return []
  }

  return data as SubSubcategory[]
}

// Get single sub-subcategory by full slug path
export async function getSubSubcategoryBySlug(
  categorySlug: string,
  subcategorySlug: string,
  subSubcategorySlug: string
): Promise<(SubSubcategory & {
  subcategories: Subcategory & { categories: Category }
}) | null> {
  const supabase = await createClient()

  // Find category by slug
  const { data: category } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', categorySlug)
    .single()

  if (!category) return null

  // Find subcategory by slug and category_id
  const { data: subcategory } = await supabase
    .from('subcategories')
    .select('id')
    .eq('category_id', category.id)
    .eq('slug', subcategorySlug)
    .single()

  if (!subcategory) return null

  // Find sub-subcategory
  const { data, error } = await supabase
    .from('sub_subcategories')
    .select('*, subcategories!sub_subcategories_subcategory_id_fkey(*, categories!subcategories_category_id_fkey(*))')
    .eq('subcategory_id', subcategory.id)
    .eq('slug', subSubcategorySlug)
    .single()

  if (error) {
    console.error('Error fetching sub-subcategory:', error)
    return null
  }

  return data as any
}

// Create — ADMIN only
export async function createSubSubcategory(data: {
  subcategory_id: string
  name_en: string
  name_ar: string
  slug: string
  image_url?: string | null
}): Promise<{ success: boolean; subSubcategory?: SubSubcategory; error?: string }> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  const supabase = await createClient()
  const { data: subSubcategory, error } = await supabase
    .from('sub_subcategories')
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error('Error creating sub-subcategory:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/categories')
  return { success: true, subSubcategory: subSubcategory as SubSubcategory }
}

// Update — ADMIN only
export async function updateSubSubcategory(
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
    .from('sub_subcategories')
    .update(data)
    .eq('id', id)

  if (error) {
    console.error('Error updating sub-subcategory:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/categories')
  return { success: true }
}

// Delete — ADMIN only
// Reassigns all products in it to sub_subcategory_id = null before deleting
export async function deleteSubSubcategory(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  const supabase = await createClient()

  // Before delete: UPDATE products SET sub_subcategory_id = null WHERE sub_subcategory_id = id
  const { error: updateError } = await supabase
    .from('products')
    .update({ sub_subcategory_id: null })
    .eq('sub_subcategory_id', id)

  if (updateError) {
    console.error('Error unassigning products from sub-subcategory:', updateError)
    return { success: false, error: updateError.message }
  }

  // Then: DELETE from sub_subcategories WHERE id = id
  const { error: deleteError } = await supabase
    .from('sub_subcategories')
    .delete()
    .eq('id', id)

  if (deleteError) {
    console.error('Error deleting sub-subcategory:', deleteError)
    return { success: false, error: deleteError.message }
  }

  revalidatePath('/admin/categories')
  return { success: true }
}

// Assign existing products to a sub-subcategory — ADMIN only
export async function assignProductsToSubSubcategory(
  subSubcategoryId: string,
  productIds: string[]
): Promise<{ success: boolean; error?: string }> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('products')
    .update({ sub_subcategory_id: subSubcategoryId })
    .in('id', productIds)

  if (error) {
    console.error('Error assigning products to sub-subcategory:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/admin/products')
  return { success: true }
}

// Remove a product from its sub-subcategory — ADMIN only
export async function removeProductFromSubSubcategory(
  productId: string
): Promise<{ success: boolean; error?: string }> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('products')
    .update({ sub_subcategory_id: null })
    .eq('id', productId)

  if (error) {
    console.error('Error removing product from sub-subcategory:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/categories')
  revalidatePath('/admin/products')
  return { success: true }
}
