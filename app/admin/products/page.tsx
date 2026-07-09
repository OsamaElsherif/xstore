import { getAdminProducts } from '@/lib/actions/products'
import { getCategoriesWithFullTree } from '@/lib/actions/subcategories'
import { getCurrentProfile } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import ProductsManager from '@/components/admin/products/ProductsManager'

export default async function AdminProductsPage() {
  const profile = await getCurrentProfile()
  
  if (!profile || profile.role !== 'ADMIN') {
    redirect('/admin')
  }

  const products = await getAdminProducts()
  const categories = await getCategoriesWithFullTree()

  return (
    <ProductsManager 
      initialProducts={products} 
      categories={categories} 
    />
  )
}
