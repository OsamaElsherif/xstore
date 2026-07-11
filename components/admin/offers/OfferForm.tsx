'use client'

import { useState, useTransition } from 'react'
import { ArrowLeft, Save, Search, Tag, Percent, DollarSign, Eye } from 'lucide-react'
import { OfferWithProducts, Offer, Product, DiscountType, computeDiscountedPrice } from '@/types'
import { createOffer, updateOffer } from '@/lib/actions/offers'
import { getProductImageUrl } from '@/lib/supabase/storage'
import Image from 'next/image'

interface OfferFormProps {
  offer?: OfferWithProducts | null
  products: (Product & { category_name_en: string | null })[]
  onSuccess: (offer: OfferWithProducts) => void
  onCancel: () => void
}

export default function OfferForm({ offer, products, onSuccess, onCancel }: OfferFormProps) {
  const isEdit = !!offer
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [productSearch, setProductSearch] = useState('')

  // Form state
  const [name, setName] = useState(offer?.name ?? '')
  const [description, setDescription] = useState(offer?.description ?? '')
  const [discountType, setDiscountType] = useState<DiscountType>(offer?.discount_type ?? 'PERCENTAGE')
  const [discountValue, setDiscountValue] = useState<number>(offer?.discount_value ?? 10)
  const [startDate, setStartDate] = useState(offer?.start_date ? offer.start_date.slice(0, 10) : '')
  const [endDate, setEndDate] = useState(offer?.end_date ? offer.end_date.slice(0, 10) : '')
  const [isActive, setIsActive] = useState(offer?.is_active ?? true)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set((offer?.offer_products ?? []).map((op) => op.product_id))
  )

  const toggleProduct = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const filteredProducts = products.filter((p) => {
    const q = productSearch.toLowerCase()
    return (
      p.name_en.toLowerCase().includes(q) ||
      p.name_ar.toLowerCase().includes(q) ||
      (p.category_name_en ?? '').toLowerCase().includes(q)
    )
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setError('Offer name is required.'); return }
    if (discountValue <= 0) { setError('Discount value must be > 0.'); return }
    if (discountType === 'PERCENTAGE' && discountValue > 100) { setError('Percentage cannot exceed 100%.'); return }
    if (selectedIds.size === 0) { setError('Select at least one product.'); return }
    setError(null)

    const data = {
      name: name.trim(),
      description: description.trim() || null,
      discount_type: discountType,
      discount_value: discountValue,
      start_date: startDate ? new Date(startDate).toISOString() : null,
      end_date: endDate ? new Date(endDate).toISOString() : null,
      is_active: isActive,
    }
    const ids = Array.from(selectedIds)

    startTransition(async () => {
      if (isEdit && offer) {
        const result = await updateOffer(offer.id, data, ids)
        if (!result.success) { setError(result.error ?? 'Update failed'); return }
        // Build updated offer shape for parent
        const updated: OfferWithProducts = {
          ...offer,
          ...data,
          updated_at: new Date().toISOString(),
          offer_products: ids.map((pid) => ({
            id: offer.offer_products.find((op) => op.product_id === pid)?.id ?? pid,
            offer_id: offer.id,
            product_id: pid,
            created_at: null,
          })) as OfferWithProducts['offer_products'],
        }
        onSuccess(updated)
      } else {
        const result = await createOffer(data, ids)
        if (!result.success || !result.offer) { setError(result.error ?? 'Create failed'); return }
        const newOffer: OfferWithProducts = {
          ...result.offer,
          offer_products: ids.map((pid) => ({
            id: pid,
            offer_id: result.offer!.id,
            product_id: pid,
            created_at: null,
          })) as OfferWithProducts['offer_products'],
        }
        onSuccess(newOffer)
      }
    })
  }

  // Preview: use first selected product for live preview
  const previewProduct = products.find((p) => selectedIds.has(p.id))
  const previewDiscount: Offer = {
    id: '', name, description: description || null,
    discount_type: discountType, discount_value: discountValue,
    start_date: startDate || null, end_date: endDate || null,
    is_active: isActive, created_at: null, updated_at: null,
  }
  const previewDiscounted = previewProduct ? computeDiscountedPrice(previewProduct.price, previewDiscount) : null
  const savingsAmt = previewProduct && previewDiscounted !== null ? previewProduct.price - previewDiscounted : null

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back button */}
      <button
        type="button"
        onClick={onCancel}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Offers
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left column — Offer details */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-5">
            <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <Tag size={20} className="text-orange-500" />
              {isEdit ? 'Edit Offer' : 'New Offer'}
            </h2>

            {error && (
              <div className="bg-red-50 text-red-600 border border-red-100 rounded-xl px-4 py-3 text-sm font-medium">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Offer Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Summer Sale"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Optional short description…"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
              />
            </div>

            {/* Discount type + value */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Discount</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDiscountType('PERCENTAGE')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    discountType === 'PERCENTAGE'
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <Percent size={14} />
                  Percentage
                </button>
                <button
                  type="button"
                  onClick={() => setDiscountType('FIXED')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                    discountType === 'FIXED'
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                  }`}
                >
                  <DollarSign size={14} />
                  Fixed (EGP)
                </button>
              </div>
              <div className="mt-2 relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">
                  {discountType === 'PERCENTAGE' ? '%' : 'EGP'}
                </span>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  min={0}
                  max={discountType === 'PERCENTAGE' ? 100 : undefined}
                  step={discountType === 'PERCENTAGE' ? 1 : 0.01}
                  className="w-full pl-14 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* Date range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-semibold text-gray-700">Active</p>
                <p className="text-xs text-gray-400">Make this offer live immediately</p>
              </div>
              <button
                type="button"
                onClick={() => setIsActive((v) => !v)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isActive ? 'bg-orange-500' : 'bg-gray-300'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isActive ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Live preview */}
            {previewProduct && previewDiscounted !== null && (
              <div className="border border-orange-100 bg-orange-50 rounded-2xl p-4">
                <p className="text-xs font-semibold text-orange-600 flex items-center gap-1 mb-3">
                  <Eye size={12} /> Live Preview
                </p>
                <div className="flex items-center gap-3">
                  {previewProduct.image_url && (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white border border-orange-100 flex-shrink-0">
                      <Image
                        src={getProductImageUrl(previewProduct.image_url) || ''}
                        alt={previewProduct.name_en}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-bold text-gray-800 line-clamp-1">{previewProduct.name_en}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-400 line-through">EGP {previewProduct.price.toLocaleString()}</span>
                      <span className="text-sm font-bold text-green-600">EGP {previewDiscounted.toLocaleString()}</span>
                      {savingsAmt !== null && savingsAmt > 0 && (
                        <span className="text-xs bg-red-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                          -{discountType === 'PERCENTAGE' ? `${discountValue}%` : `EGP ${savingsAmt.toLocaleString()}`}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold transition-colors disabled:opacity-60 shadow-sm"
          >
            <Save size={18} />
            {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Offer'}
          </button>
        </div>

        {/* Right column — Product picker */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 space-y-4">
          <div>
            <h2 className="font-bold text-gray-900 text-lg mb-1">Select Products</h2>
            <p className="text-xs text-gray-400">{selectedIds.size} selected</p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>

          {/* Product list */}
          <div className="overflow-y-auto max-h-[480px] space-y-2 pr-1">
            {filteredProducts.map((p) => {
              const selected = selectedIds.has(p.id)
              const discounted = computeDiscountedPrice(p.price, previewDiscount)
              return (
                <label
                  key={p.id}
                  className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                    selected
                      ? 'border-orange-300 bg-orange-50'
                      : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleProduct(p.id)}
                    className="w-4 h-4 accent-orange-500 flex-shrink-0"
                  />
                  {p.image_url && (
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image
                        src={getProductImageUrl(p.image_url) || ''}
                        alt={p.name_en}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 line-clamp-1">{p.name_en}</p>
                    <p className="text-xs text-gray-400">{p.category_name_en ?? 'No category'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {selected && discountValue > 0 ? (
                      <>
                        <p className="text-xs text-gray-400 line-through">EGP {p.price.toLocaleString()}</p>
                        <p className="text-sm font-bold text-green-600">EGP {discounted.toLocaleString()}</p>
                      </>
                    ) : (
                      <p className="text-sm font-semibold text-gray-700">EGP {p.price.toLocaleString()}</p>
                    )}
                  </div>
                </label>
              )
            })}
            {filteredProducts.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-8">No products match your search.</p>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
