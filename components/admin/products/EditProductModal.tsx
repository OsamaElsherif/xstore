'use client'

import { useState, useEffect } from 'react'
import { Product, Category, Subcategory, SubSubcategory } from '@/types'
import { X, Save, AlertCircle } from 'lucide-react'
import { updateProduct } from '@/lib/actions/products'
import { getSubcategoriesByCategory } from '@/lib/actions/subcategories'
import { getSubSubcategoriesBySubcategory } from '@/lib/actions/sub-subcategories'
import ImageUploader from './ImageUploader'
import { uploadProductImage } from '@/lib/supabase/storage'

interface EditProductModalProps {
  product: Product & { sub_subcategory_id?: string | null }
  categories: Category[]
  onClose: () => void
  onUpdated: (p: Product) => void
}

export default function EditProductModal({ product, categories, onClose, onUpdated }: EditProductModalProps) {
  const [formData, setFormData] = useState({
    name_en: product.name_en,
    name_ar: product.name_ar,
    description_en: product.description_en || '',
    description_ar: product.description_ar || '',
    category_id: product.category_id,
    subcategory_id: product.subcategory_id || '',
    sub_subcategory_id: product.sub_subcategory_id || '',
    price: product.price,
    stock_quantity: product.stock_quantity,
    badge: product.badge || '',
    is_service: product.is_service,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])
  const [subSubcategories, setSubSubcategories] = useState<SubSubcategory[]>([])

  // Fetch subcategories when category changes
  useEffect(() => {
    if (formData.category_id) {
      getSubcategoriesByCategory(formData.category_id).then(setSubcategories)
    } else {
      setSubcategories([])
    }
    // Only reset subcategory if category actually changed from the original
    if (formData.category_id !== product.category_id) {
      setFormData(prev => ({ ...prev, subcategory_id: '', sub_subcategory_id: '' }))
    }
  }, [formData.category_id, product.category_id])

  // Fetch sub-subcategories when subcategory changes
  useEffect(() => {
    if (formData.subcategory_id) {
      getSubSubcategoriesBySubcategory(formData.subcategory_id).then(setSubSubcategories)
    } else {
      setSubSubcategories([])
    }
    // Only reset sub-subcategory if subcategory actually changed from the original
    if (formData.subcategory_id !== product.subcategory_id) {
      setFormData(prev => ({ ...prev, sub_subcategory_id: '' }))
    }
  }, [formData.subcategory_id, product.subcategory_id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      let image_url = product.image_url

      // 1. Upload new image if selected
      if (imageFile) {
        image_url = await uploadProductImage(imageFile)
      }

      // 2. Update product
      const result = await updateProduct(product.id, {
        ...formData,
        subcategory_id: formData.subcategory_id || null,
        sub_subcategory_id: formData.sub_subcategory_id || null,
        image_url,
      })

      if (result.success) {
        onUpdated({ ...product, ...formData, image_url })
        onClose()
      } else {
        setError(result.error || 'Failed to update product')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Edit Product</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column: Details */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name (English)*</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name_en}
                    onChange={e => setFormData({...formData, name_en: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 text-right font-arabic">الاسم (بالعربية)*</label>
                  <input 
                    type="text" 
                    required
                    dir="rtl"
                    value={formData.name_ar}
                    onChange={e => setFormData({...formData, name_ar: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-arabic"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                <select 
                  required
                  value={formData.category_id || ''}
                  onChange={e => setFormData({...formData, category_id: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="">Select Category</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name_en}</option>
                  ))}
                </select>
              </div>

              {subcategories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                  <select 
                    value={formData.subcategory_id}
                    onChange={e => setFormData({...formData, subcategory_id: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="">None (No Subcategory)</option>
                    {subcategories.map(s => (
                      <option key={s.id} value={s.id}>{s.name_en}</option>
                    ))}
                  </select>
                </div>
              )}

              {subSubcategories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Series (Sub-subcategory)</label>
                  <select 
                    value={formData.sub_subcategory_id}
                    onChange={e => setFormData({...formData, sub_subcategory_id: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option value="">None (No Series)</option>
                    {subSubcategories.map(ss => (
                      <option key={ss.id} value={ss.id}>{ss.name_en}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (EGP)*</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock*</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    disabled={formData.is_service ?? undefined}
                    value={formData.is_service ? 0 : formData.stock_quantity ?? 0}
                    onChange={e => setFormData({...formData, stock_quantity: Number(e.target.value)})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 py-2">
                <input 
                  type="checkbox" 
                  id="is_service"
                  checked={formData.is_service ?? false}
                  onChange={e => setFormData({...formData, is_service: e.target.checked, stock_quantity: e.target.checked ? 0 : formData.stock_quantity})}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <label htmlFor="is_service" className="text-sm font-medium text-gray-700">This is a repair service (No physical stock)</label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Badge (Optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. New, Popular, Sale"
                  value={formData.badge}
                  onChange={e => setFormData({...formData, badge: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>

            {/* Right Column: Image & Descriptions */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Image</label>
                <ImageUploader 
                  currentImageUrl={product.image_url}
                  onFileSelected={setImageFile}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (English)</label>
                <textarea 
                  rows={3}
                  value={formData.description_en}
                  onChange={e => setFormData({...formData, description_en: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 text-right font-arabic">الوصف (بالعربية)</label>
                <textarea 
                  rows={3}
                  dir="rtl"
                  value={formData.description_ar}
                  onChange={e => setFormData({...formData, description_ar: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-arabic"
                />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
