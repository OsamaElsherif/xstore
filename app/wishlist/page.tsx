import { getWishlist } from '@/lib/actions/wishlist'
import { getCurrentUser } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import WishlistPage from '@/components/wishlist/WishlistPage'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default async function Page() {
  const user = await getCurrentUser()
  
  if (!user) {
    redirect('/login')
  }

  const wishlistItems = await getWishlist()

  return (
    <main className="min-h-screen flex flex-col bg-brand-light/30">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto px-6 py-12 w-full">
        <WishlistPage initialItems={wishlistItems} />
      </div>
      <Footer />
    </main>
  )
}
