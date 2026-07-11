import { getProductById, getRelatedProducts } from '@/lib/actions/products'
import { getActiveOfferForProduct } from '@/lib/actions/offers'
import { notFound } from 'next/navigation'
import ProductPage from '@/components/products/ProductPage'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: PageProps) {
  const { id } = await params
  
  // Fetch product first to get the category_id
  const product = await getProductById(id)

  if (!product) {
    notFound()
  }

  // Fetch active offer and related products in parallel
  const [activeOffer, relatedProducts] = await Promise.all([
    getActiveOfferForProduct(id),
    product.category_id ? getRelatedProducts(product.category_id, id) : Promise.resolve([])
  ])

  return (
    <main className="min-h-screen flex flex-col bg-brand-light/30">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        <ProductPage 
          product={product} 
          relatedProducts={relatedProducts}
          activeOffer={activeOffer}
        />
      </div>
      <Footer />
    </main>
  )
}
