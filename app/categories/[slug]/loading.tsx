import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function Loading() {
  return (
    <main className="min-h-screen flex flex-col bg-brand-light/30">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="animate-pulse space-y-12">
          <div className="h-64 w-full bg-gray-200 rounded-3xl"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 space-y-4 border border-gray-100">
                <div className="aspect-square bg-gray-200 rounded-xl"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
