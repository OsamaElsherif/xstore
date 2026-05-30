'use client'

import { useState, useEffect } from 'react'
import { Category, Product, Subcategory } from '@/types'
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react'
import { createProduct } from '@/lib/actions/products'
import { getSubcategoriesByCategory } from '@/lib/actions/subcategories'
import ImageUploader from './ImageUploader'
import { uploadProductImage } from '@/lib/supabase/storage'

interface SingleProductFormProps {
  categories: Category[]
  onCreated: (p: Product) => void
}

export default function SingleProductForm({ categories, onCreated }: SingleProductFormProps) {
  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    description_en: '',
    description_ar: '',
    category_id: '',
    subcategory_id: '' as string,
    price: 0,
    stock_quantity: 0,
    badge: '',
    is_service: false,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [subcategories, setSubcategories] = useState<Subcategory[]>([])

  // Fetch subcategories when category changes
  useEffect(() => {
    if (formData.category_id) {
      getSubcategoriesByCategory(formData.category_id).then(setSubcategories)
    } else {
      setSubcategories([])
    }
    setFormData(prev => ({ ...prev, subcategory_id: '' }))
  }, [formData.category_id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      let image_url = null

      // 1. Upload image if selected
      if (imageFile) {
        image_url = await uploadProductImage(imageFile)
      }

      // 2. Create product
      const result = await createProduct({
        ...formData,
        subcategory_id: formData.subcategory_id || null,
        image_url,
      })

      if (result.success && result.product) {
        setSuccess(true)
        setFormData({
          name_en: '',
          name_ar: '',
          description_en: '',
          description_ar: '',
          category_id: '',
          subcategory_id: '',
          price: 0,
          stock_quantity: 0,
          badge: '',
          is_service: false,
        })
        setImageFile(null)
        setSubcategories([])
        onCreated(result.product)
      } else {
        setError(result.error || 'Failed to create product')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Add New Product</h2>
        <p className="text-gray-500 text-sm">Fill in the details below to add a single product to your catalog.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-green-600 text-sm flex items-center gap-2">
            <CheckCircle2 size={18} />
            Product created successfully!
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
                  placeholder="e.g. iPhone 15 Pro"
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
                  placeholder="مثال: ايفون ١٥ برو"
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
                value={formData.category_id}
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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (EGP)*</label>
                <input 
                  type="number" 
                  required
                  min="1"
                  placeholder="0.00"
                  value={formData.price || ''}
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
                  disabled={formData.is_service}
                  placeholder="0"
                  value={formData.is_service ? 0 : (formData.stock_quantity || '')}
                  onChange={e => setFormData({...formData, stock_quantity: Number(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 py-2">
              <input 
                type="checkbox" 
                id="is_service_new"
                checked={formData.is_service}
                onChange={e => setFormData({...formData, is_service: e.target.checked, stock_quantity: e.target.checked ? 0 : formData.stock_quantity})}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <label htmlFor="is_service_new" className="text-sm font-medium text-gray-700">This is a repair service (No physical stock)</label>
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
                onFileSelected={setImageFile}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (English)</label>
              <textarea 
                rows={3}
                placeholder="Product description in English..."
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
                placeholder="وصف المنتج باللغة العربية..."
                value={formData.description_ar}
                onChange={e => setFormData({...formData, description_ar: e.target.value})}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none font-arabic"
              />
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button 
            type="submit"
            disabled={isSubmitting}
            className="px-10 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Creating Product...
              </>
            ) : (
              <>
                <Save size={20} />
                Create Product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
