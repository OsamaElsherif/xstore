import { getProductsByCategory } from '@/lib/actions/products'
import { notFound } from 'next/navigation'
import CategoryPage from '@/components/categories/CategoryPage'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params
  const { products, category } = await getProductsByCategory(slug)

  if (!category) {
    notFound()
  }

  return (
    <main className="min-h-screen flex flex-col bg-brand-light/30">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        <CategoryPage 
          initialProducts={products} 
          category={category} 
        />
      </div>
      <Footer />
    </main>
  )
}
