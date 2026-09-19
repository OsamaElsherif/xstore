import { getCurrentProfile } from '@/lib/actions/auth'
import { getAllOffers } from '@/lib/actions/offers'
import { getAdminProducts } from '@/lib/actions/products'
import { redirect } from 'next/navigation'
import OffersManager from '@/components/admin/offers/OffersManager'

export const metadata = {
  title: 'Offers & Discounts — XStore Admin',
  description: 'Create and manage promotional offers and discounts.',
}

export default async function AdminOffersPage() {
  const profile = await getCurrentProfile()
  if (!profile || profile.role !== 'ADMIN') redirect('/admin')

  const [offers, products] = await Promise.all([getAllOffers(), getAdminProducts()])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Offers &amp; Discounts</h1>
        <p className="text-sm text-gray-500 mt-1">
          Create percentage or fixed-amount promotions and attach them to products.
        </p>
      </div>
      <OffersManager initialOffers={offers} products={products} />
    </div>
  )
}
