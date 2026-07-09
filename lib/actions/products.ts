'use server'

import { createClient } from '@/lib/supabase/server'
import { Product, Category, Subcategory, SubSubcategory, ProductWithRelations } from '@/types'
import { TablesInsert } from '@/types/database.types'
import { getCurrentProfile } from './auth'
import { revalidatePath } from 'next/cache'

type ProductInsert = TablesInsert<'products'>

export async function getProducts(categorySlug?: string): Promise<Product[]> {
  const supabase = await createClient()
  
  let query = supabase.from('products').select('*, categories!inner(*)')
  
  if (categorySlug) {
    query = query.eq('categories.slug', categorySlug)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching products:', error)
    return []
  }
  
  return data as Product[]
}

export async function getAllProductsForShop(options?: {
  categorySlug?: string
  subcategorySlug?: string
  subSubcategorySlug?: string
  sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'rating'
  minPrice?: number
  maxPrice?: number
  inStockOnly?: boolean
  searchQuery?: string
  page?: number
  pageSize?: number
}): Promise<{
  products: (Product & { categories: Category | null })[]
  totalCount: number
  currentPage: number
  totalPages: number
}> {
  const supabase = await createClient()
  const page = options?.page ?? 1
  const pageSize = options?.pageSize ?? 12
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  // If filtering by category slug, resolve to category ID first
  let categoryId: string | undefined
  if (options?.categorySlug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', options.categorySlug)
      .single()
    if (cat) categoryId = cat.id
  }

  let subcategoryId: string | undefined
  if (categoryId && options?.subcategorySlug) {
    const { data: subcat } = await supabase
      .from('subcategories')
      .select('id')
      .eq('category_id', categoryId)
      .eq('slug', options.subcategorySlug)
      .single()
    if (subcat) subcategoryId = subcat.id
  }

  let subSubcategoryId: string | undefined
  if (subcategoryId && options?.subSubcategorySlug) {
    const { data: subsubcat } = await supabase
      .from('sub_subcategories')
      .select('id')
      .eq('subcategory_id', subcategoryId)
      .eq('slug', options.subSubcategorySlug)
      .single()
    if (subsubcat) subSubcategoryId = subsubcat.id
  }

  let query = supabase
    .from('products')
    .select('*, categories(*)', { count: 'exact' })

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  if (subcategoryId) {
    query = query.eq('subcategory_id', subcategoryId)
  }

  if (subSubcategoryId) {
    query = query.eq('sub_subcategory_id', subSubcategoryId)
  }

  // Search
  if (options?.searchQuery) {
    const q = options.searchQuery
    query = query.or(`name_en.ilike.%${q}%,name_ar.ilike.%${q}%`)
  }

  // Price range
  if (options?.minPrice !== undefined) {
    query = query.gte('price', options.minPrice)
  }
  if (options?.maxPrice !== undefined) {
    query = query.lte('price', options.maxPrice)
  }

  // In stock only (skip for services)
  if (options?.inStockOnly) {
    query = query.or('stock_quantity.gt.0,is_service.eq.true')
  }

  // Sort
  switch (options?.sortBy) {
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    case 'rating':
      query = query.order('rating', { ascending: false })
      break
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false })
      break
  }

  // Pagination
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching shop products:', error)
    return { products: [], totalCount: 0, currentPage: page, totalPages: 0 }
  }

  const totalCount = count ?? 0
  const totalPages = Math.ceil(totalCount / pageSize)

  return {
    products: (data ?? []) as (Product & { categories: Category | null })[],
    totalCount,
    currentPage: page,
    totalPages,
  }
}

export async function getProductById(id: string): Promise<(Product & { categories: Category | null }) | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('id', id)
    .single()
    
  if (error) {
    console.error('Error fetching product:', error)
    return null
  }
  
  return data as (Product & { categories: Category | null })
}

export async function getRelatedProducts(categoryId: string, excludeProductId: string): Promise<Product[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category_id', categoryId)
    .neq('id', excludeProductId)
    .limit(4)

  if (error) {
    console.error('Error fetching related products:', error)
    return []
  }

  return data as Product[]
}

export async function getProductsByCategory(
  categorySlug: string,
  options?: {
    subcategorySlug?: string
    subSubcategorySlug?: string
    sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest'
    minPrice?: number
    maxPrice?: number
    inStockOnly?: boolean
  }
): Promise<{
  products: ProductWithRelations[]
  category: Category | null
  subcategory: Subcategory | null
  subSubcategory: SubSubcategory | null
}> {
  const supabase = await createClient()

  // 1. Get category info
  const { data: category, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', categorySlug)
    .single()

  if (catError || !category) {
    return { products: [], category: null, subcategory: null, subSubcategory: null }
  }

  // 2. If subcategory slug provided, resolve it
  let subcategory: Subcategory | null = null
  if (options?.subcategorySlug) {
    const { data: subcat } = await supabase
      .from('subcategories')
      .select('*')
      .eq('category_id', category.id)
      .eq('slug', options.subcategorySlug)
      .single()

    if (!subcat) {
      return { products: [], category: category as Category, subcategory: null, subSubcategory: null }
    }
    subcategory = subcat as Subcategory
  }

  // 2b. If sub-subcategory slug provided, resolve it
  let subSubcategory: SubSubcategory | null = null
  if (subcategory && options?.subSubcategorySlug) {
    const { data: subsubcat } = await supabase
      .from('sub_subcategories')
      .select('*')
      .eq('subcategory_id', subcategory.id)
      .eq('slug', options.subSubcategorySlug)
      .single()

    if (!subsubcat) {
      return { products: [], category: category as Category, subcategory, subSubcategory: null }
    }
    subSubcategory = subsubcat as SubSubcategory
  }

  // 3. Get products
  let query = supabase
    .from('products')
    .select('*, categories(*), subcategories(*), sub_subcategories(*)')
    .eq('category_id', category.id)

  // Filter by subcategory if provided
  if (subcategory) {
    query = query.eq('subcategory_id', subcategory.id)
  }

  // Filter by sub-subcategory if provided
  if (subSubcategory) {
    query = query.eq('sub_subcategory_id', subSubcategory.id)
  }

  if (options?.minPrice) query = query.gte('price', options.minPrice)
  if (options?.maxPrice) query = query.lte('price', options.maxPrice)
  if (options?.inStockOnly) query = query.gt('stock_quantity', 0)

  switch (options?.sortBy) {
    case 'price_asc': query = query.order('price', { ascending: true }); break
    case 'price_desc': query = query.order('price', { ascending: false }); break
    case 'rating': query = query.order('rating', { ascending: false }); break
    case 'newest': query = query.order('created_at', { ascending: false }); break
    default: query = query.order('created_at', { ascending: false })
  }

  const { data: products, error: prodError } = await query

  if (prodError) {
    console.error('Error fetching products by category:', prodError)
    return { products: [], category: category as Category, subcategory, subSubcategory }
  }

  return { products: products as any[], category: category as Category, subcategory, subSubcategory }
}

export async function searchProducts(
  query: string,
  options?: {
    categorySlug?: string
    limit?: number
  }
): Promise<Product[]> {
  const supabase = await createClient()

  // Primary: full-text search if query is substantial, otherwise fallback to ILIKE
  // We use a combination for better coverage
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name_en, slug)')
    .or(`name_en.ilike.%${query}%, name_ar.ilike.%${query}%, description_en.ilike.%${query}%, description_ar.ilike.%${query}%`)
    .limit(options?.limit ?? 20)

  if (error) {
    console.error('Error searching products:', error)
    return []
  }

  return data as Product[]
}

export async function getFeaturedProducts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, categories!inner(*)')
    
  if (error) {
    console.error('Error fetching featured products:', error)
    return { phones: [], accessories: [], vapes: [] }
  }
  
  const products = data as (Product & { categories: { slug: string } })[]

  return {
    phones: products.filter(p => p.categories.slug === 'phones'),
    accessories: products.filter(p => p.categories.slug === 'accessories'),
    vapes: products.filter(p => p.categories.slug === 'vapes')
  }
}

// Admin Functions

export async function getAdminProducts(): Promise<(Product & { category_name_en: string | null })[]> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'ADMIN') {
    throw new Error('Unauthorized')
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name_en)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admin products:', error)
    return []
  }

  return (data || []).map((p: any) => ({
    ...p,
    category_name_en: p.categories?.name_en || null
  })) as (Product & { category_name_en: string | null })[]
}

export async function createProduct(data: ProductInsert): Promise<{ success: boolean; error?: string; product?: Product }> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  const supabase = await createClient()

  // Validate sub_subcategory belongs to subcategory
  if (data.sub_subcategory_id) {
    const { data: subSub } = await supabase
      .from('sub_subcategories')
      .select('subcategory_id')
      .eq('id', data.sub_subcategory_id)
      .single()

    if (subSub?.subcategory_id !== data.subcategory_id) {
      return { success: false, error: 'Sub-subcategory does not belong to the selected subcategory' }
    }
  }

  const { data: product, error } = await supabase
    .from('products')
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error('Error creating product:', error)
    console.log(error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/products')
  return { success: true, product: product as Product }
}

export async function createProductsBulk(products: ProductInsert[]): Promise<{
  success: number
  failed: number
  errors: string[]
}> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'ADMIN') {
    return { success: 0, failed: products.length, errors: ['Unauthorized'] }
  }

  const supabase = await createClient()
  let successCount = 0
  let failedCount = 0
  const errorMessages: string[] = []

  // Loop through each product and insert individually so one failure doesn't block the rest
  for (const productData of products) {
    const { error } = await supabase.from('products').insert(productData)
    if (error) {
      failedCount++
      errorMessages.push(`Row ${successCount + failedCount}: ${error.message}`)
    } else {
      successCount++
    }
  }

  revalidatePath('/admin/products')
  return {
    success: successCount,
    failed: failedCount,
    errors: errorMessages
  }
}

export async function updateProduct(id: string, data: Partial<ProductInsert>): Promise<{ success: boolean; error?: string }> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  const supabase = await createClient()

  // Validate sub_subcategory belongs to subcategory
  if (data.sub_subcategory_id) {
    const { data: subSub } = await supabase
      .from('sub_subcategories')
      .select('subcategory_id')
      .eq('id', data.sub_subcategory_id)
      .single()

    const subcategoryId = data.subcategory_id !== undefined ? data.subcategory_id : (
      await supabase.from('products').select('subcategory_id').eq('id', id).single().then(r => r.data?.subcategory_id)
    )

    if (subSub?.subcategory_id !== subcategoryId) {
      return { success: false, error: 'Sub-subcategory does not belong to the selected subcategory' }
    }
  }

  const { error } = await supabase
    .from('products')
    .update(data)
    .eq('id', id)

  if (error) {
    console.error('Error updating product:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/products')
  return { success: true }
}

export async function deleteProduct(id: string): Promise<{ success: boolean; error?: string }> {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'ADMIN') {
    return { success: false, error: 'Unauthorized' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting product:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin/products')
  return { success: true }
}
