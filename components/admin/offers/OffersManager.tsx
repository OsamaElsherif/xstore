'use client'

import { useState, useTransition } from 'react'
import { Plus, Tag, Calendar, Percent, DollarSign, ToggleLeft, ToggleRight, Pencil, Trash2, Package } from 'lucide-react'
import { OfferWithProducts, Offer } from '@/types'
import { Product } from '@/types'
import { deleteOffer, toggleOfferActive } from '@/lib/actions/offers'
import OfferForm from './OfferForm'

type OfferStatus = 'all' | 'active' | 'scheduled' | 'expired' | 'inactive'

interface OffersManagerProps {
  initialOffers: OfferWithProducts[]
  products: (Product & { category_name_en: string | null })[]
}

function getOfferStatus(offer: Offer): 'active' | 'scheduled' | 'expired' | 'inactive' {
  if (!offer.is_active) return 'inactive'
  const now = new Date()
  const start = offer.start_date ? new Date(offer.start_date) : null
  const end = offer.end_date ? new Date(offer.end_date) : null
  if (end && end < now) return 'expired'
  if (start && start > now) return 'scheduled'
  return 'active'
}

const STATUS_CONFIG = {
  active: { label: 'Active', className: 'bg-green-100 text-green-700 border-green-200' },
  scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  expired: { label: 'Expired', className: 'bg-gray-100 text-gray-500 border-gray-200' },
  inactive: { label: 'Inactive', className: 'bg-red-100 text-red-600 border-red-200' },
}

const TABS: { id: OfferStatus; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'expired', label: 'Expired' },
  { id: 'inactive', label: 'Inactive' },
]

export default function OffersManager({ initialOffers, products }: OffersManagerProps) {
  const [offers, setOffers] = useState<OfferWithProducts[]>(initialOffers)
  const [activeTab, setActiveTab] = useState<OfferStatus>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingOffer, setEditingOffer] = useState<OfferWithProducts | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = offers.filter((o) => {
    if (activeTab === 'all') return true
    return getOfferStatus(o) === activeTab
  })

  const handleToggle = (offerId: string, currentActive: boolean) => {
    startTransition(async () => {
      const result = await toggleOfferActive(offerId, !currentActive)
      if (result.success) {
        setOffers((prev) =>
          prev.map((o) =>
            o.id === offerId ? { ...o, is_active: !currentActive } : o
          )
        )
      }
    })
  }

  const handleDelete = (offerId: string) => {
    if (!confirm('Delete this offer? This action cannot be undone.')) return
    startTransition(async () => {
      const result = await deleteOffer(offerId)
      if (result.success) {
        setOffers((prev) => prev.filter((o) => o.id !== offerId))
      }
    })
  }

  const handleFormSuccess = (updated: OfferWithProducts) => {
    setOffers((prev) => {
      const existing = prev.findIndex((o) => o.id === updated.id)
      if (existing >= 0) {
        const next = [...prev]
        next[existing] = updated
        return next
      }
      return [updated, ...prev]
    })
    setShowForm(false)
    setEditingOffer(null)
  }

  if (showForm || editingOffer) {
    return (
      <OfferForm
        offer={editingOffer}
        products={products}
        onSuccess={handleFormSuccess}
        onCancel={() => { setShowForm(false); setEditingOffer(null) }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white shadow text-gray-900'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.id !== 'all' && (
                <span className="ml-1.5 text-xs text-gray-400">
                  ({offers.filter((o) => getOfferStatus(o) === tab.id).length})
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl font-semibold text-sm hover:bg-blue-600 transition-colors shadow-sm"
        >
          <Plus size={16} />
          New Offer
        </button>
      </div>

      {/* Offers list */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Tag size={28} className="text-blue-500" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">No offers found</h3>
          <p className="text-sm text-gray-500 mb-6">
            {activeTab === 'all' ? 'Create your first offer to start attracting customers.' : `No ${activeTab} offers.`}
          </p>
          {activeTab === 'all' && (
            <button
              onClick={() => setShowForm(true)}
              className="px-5 py-2 bg-orange-500 text-white rounded-xl font-semibold text-sm hover:bg-orange-600 transition-colors"
            >
              Create Offer
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((offer) => {
            const status = getOfferStatus(offer)
            const { label: statusLabel, className: statusClass } = STATUS_CONFIG[status]
            const productCount = offer.offer_products?.length ?? 0

            return (
              <div
                key={offer.id}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow"
              >
                {/* Discount badge */}
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0">
                  {offer.discount_type === 'PERCENTAGE'
                    ? <Percent size={24} className="text-blue-500" />
                    : <DollarSign size={24} className="text-blue-500" />
                  }
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-base">{offer.name}</h3>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusClass}`}>
                      {statusLabel}
                    </span>
                  </div>
                  {offer.description && (
                    <p className="text-sm text-gray-500 mb-2 line-clamp-1">{offer.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1 font-semibold text-red-600">
                      {offer.discount_type === 'PERCENTAGE'
                        ? `${offer.discount_value}% OFF`
                        : `EGP ${offer.discount_value} OFF`
                      }
                    </span>
                    <span className="flex items-center gap-1">
                      <Package size={12} />
                      {productCount} product{productCount !== 1 ? 's' : ''}
                    </span>
                    {(offer.start_date || offer.end_date) && (
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {offer.start_date ? new Date(offer.start_date).toLocaleDateString() : '∞'}
                        {' — '}
                        {offer.end_date ? new Date(offer.end_date).toLocaleDateString() : '∞'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Toggle */}
                  <button
                    onClick={() => handleToggle(offer.id, offer.is_active)}
                    disabled={isPending}
                    title={offer.is_active ? 'Deactivate' : 'Activate'}
                    className="p-2 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    {offer.is_active
                      ? <ToggleRight size={28} className="text-green-500" />
                      : <ToggleLeft size={28} className="text-gray-400" />
                    }
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => setEditingOffer(offer)}
                    className="p-2 rounded-xl hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-colors"
                    title="Edit offer"
                  >
                    <Pencil size={18} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(offer.id)}
                    disabled={isPending}
                    className="p-2 rounded-xl hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors"
                    title="Delete offer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
