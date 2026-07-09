import { createClient } from './client'

const BUCKET_NAME = 'product-images'

// Returns full public URL for a stored image path
export function getProductImageUrl(path: string | null): string {
  if (!path) return '/placeholder-product.png'
  if (path.startsWith('http')) return path
  
  const supabase = createClient()
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path)
  return data.publicUrl
}

// Uploads a file and returns the stored path
export async function uploadProductImage(file: File): Promise<string> {
  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filename, file, { 
      cacheControl: '3600',
      upsert: false,
    })

  if (error) console.log(error)

  if (error) throw new Error(error.message)
  return data.path
}
