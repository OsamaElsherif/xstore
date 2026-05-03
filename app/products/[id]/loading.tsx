import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function Loading() {
  return (
    <main className="min-h-screen flex flex-col bg-brand-light/30">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="animate-pulse">
          <div className="h-6 w-48 bg-gray-200 rounded mb-8"></div>
          <div className="flex flex-col md:flex-row gap-12">
            <div className="w-full md:w-1/2 aspect-square bg-gray-200 rounded-3xl"></div>
            <div className="w-full md:w-1/2 space-y-6">
              <div className="h-10 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-6 w-1/4 bg-gray-200 rounded"></div>
              <div className="h-24 w-full bg-gray-200 rounded"></div>
              <div className="h-12 w-48 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
