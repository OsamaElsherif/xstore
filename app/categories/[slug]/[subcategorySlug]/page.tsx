import { getProductsByCategory } from '@/lib/actions/products'
import { getSubcategoriesByCategory } from '@/lib/actions/subcategories'
import { notFound } from 'next/navigation'
import CategoryPage from '@/components/categories/CategoryPage'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface PageProps {
  params: Promise<{ slug: string; subcategorySlug: string }>
  searchParams: Promise<{ sort?: string; minPrice?: string; maxPrice?: string; inStock?: string }>
}

export default async function SubcategoryPage({ params, searchParams }: PageProps) {
  const { slug, subcategorySlug } = await params
  const search = await searchParams

  const result = await getProductsByCategory(slug, {
    subcategorySlug,
    sortBy: search.sort as any,
    minPrice: search.minPrice ? Number(search.minPrice) : undefined,
    maxPrice: search.maxPrice ? Number(search.maxPrice) : undefined,
    inStockOnly: search.inStock === 'true',
  })

  if (!result.category || !result.subcategory) {
    notFound()
  }

  // Fetch sibling subcategories for sidebar filter links
  const subcategories = await getSubcategoriesByCategory(result.category.id)

  return (
    <main className="min-h-screen flex flex-col bg-brand-light/30">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        <CategoryPage 
          initialProducts={result.products} 
          category={result.category}
          subcategory={result.subcategory}
          subcategories={subcategories}
        />
      </div>
      <Footer />
    </main>
  )
}
