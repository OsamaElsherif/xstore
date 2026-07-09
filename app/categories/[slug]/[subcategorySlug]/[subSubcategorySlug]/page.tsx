import { getProductsByCategory } from '@/lib/actions/products'
import { getSubcategoriesByCategory } from '@/lib/actions/subcategories'
import { getSubSubcategoriesBySubcategory } from '@/lib/actions/sub-subcategories'
import { notFound } from 'next/navigation'
import CategoryPage from '@/components/categories/CategoryPage'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface PageProps {
  params: Promise<{ slug: string; subcategorySlug: string; subSubcategorySlug: string }>
  searchParams: Promise<{ sort?: string; minPrice?: string; maxPrice?: string; inStock?: string }>
}

export default async function SubSubcategoryPage({ params, searchParams }: PageProps) {
  const { slug, subcategorySlug, subSubcategorySlug } = await params
  const search = await searchParams

  const result = await getProductsByCategory(slug, {
    subcategorySlug,
    subSubcategorySlug,
    sortBy: search.sort as any,
    minPrice: search.minPrice ? Number(search.minPrice) : undefined,
    maxPrice: search.maxPrice ? Number(search.maxPrice) : undefined,
    inStockOnly: search.inStock === 'true',
  })

  if (!result.category || !result.subcategory || !result.subSubcategory) {
    notFound()
  }

  // Fetch sibling subcategories and sibling sub-subcategories for sidebar filter links
  const [subcategories, subSubcategories] = await Promise.all([
    getSubcategoriesByCategory(result.category.id),
    getSubSubcategoriesBySubcategory(result.subcategory.id),
  ])

  return (
    <main className="min-h-screen flex flex-col bg-brand-light/30">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        <CategoryPage
          initialProducts={result.products}
          category={result.category}
          subcategory={result.subcategory}
          subSubcategory={result.subSubcategory}
          subcategories={subcategories}
          subSubcategories={subSubcategories}
        />
      </div>
      <Footer />
    </main>
  )
}
