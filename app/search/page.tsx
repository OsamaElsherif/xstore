import { searchProducts } from '@/lib/actions/products'
import SearchResultsPage from '@/components/search/SearchResultsPage'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Suspense } from 'react'

interface PageProps {
  searchParams: Promise<{ q?: string }>
}

async function SearchResults({ q }: { q: string }) {
  if (!q) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-2xl font-bold text-brand-dark mb-4">What are you looking for?</h2>
        <p className="text-brand-gray">Enter a search term above to find products.</p>
      </div>
    )
  }

  const results = await searchProducts(q)

  return <SearchResultsPage query={q} initialResults={results} />
}

export default async function Page({ searchParams }: PageProps) {
  const { q = '' } = await searchParams

  return (
    <main className="min-h-screen flex flex-col bg-brand-light/30">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        <Suspense fallback={
          <div className="animate-pulse grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-4 space-y-4 border border-brand-gray/10">
                <div className="aspect-square bg-brand-light/50 rounded-2xl"></div>
                <div className="h-4 w-3/4 bg-brand-light/50 rounded"></div>
                <div className="h-4 w-1/2 bg-brand-light/50 rounded"></div>
              </div>
            ))}
          </div>
        }>
          <SearchResults q={q} />
        </Suspense>
      </div>
      <Footer />
    </main>
  )
}
