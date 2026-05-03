'use client'

import { useState, useMemo } from 'react'
import { Product, Category } from '@/types'
import { Search, Edit, Trash2, Package, Check, X } from 'lucide-react'
import { deleteProduct } from '@/lib/actions/products'
import EditProductModal from './EditProductModal'
import Image from 'next/image'
import { getProductImageUrl } from '@/lib/supabase/storage'
import { useLanguage } from '@/contexts/LanguageContext'

interface ProductListProps {
  products: (Product & { category_name_en: string | null })[]
  categories: Category[]
  onDeleted: (id: string) => void
  onUpdated: (p: Product) => void
}

export default function ProductList({ products, categories, onDeleted, onUpdated }: ProductListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const { t } = useLanguage()

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name_en.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            p.name_ar.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === 'All' || p.category_id === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [products, searchQuery, categoryFilter])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    setIsDeleting(id)
    const result = await deleteProduct(id)
    if (result.success) {
      onDeleted(id)
    } else {
      alert(result.error || 'Failed to delete product')
    }
    setIsDeleting(null)
  }

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by name (EN/AR)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select 
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="All">All Categories</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name_en}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500">
              <th className="p-4 font-medium">Image</th>
              <th className="p-4 font-medium">Name (EN)</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Stock</th>
              <th className="p-4 font-medium text-center">Badge</th>
              <th className="p-4 font-medium text-center">Service</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredProducts.map(product => (
              <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                    <Image 
                      src={getProductImageUrl(product.image_url) || '/placeholder-product.png'} 
                      alt={product.name_en}
                      fill
                      className="object-cover"
                    />
                  </div>
                </td>
                <td className="p-4">
                  <p className="font-semibold text-gray-800">{product.name_en}</p>
                  <p className="text-xs text-gray-400 font-arabic" dir="rtl">{product.name_ar}</p>
                </td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                    {product.category_name_en || 'Uncategorized'}
                  </span>
                </td>
                <td className="p-4 font-medium text-gray-900">
                  {t('egp')} {product.price.toLocaleString()}
                </td>
                <td className="p-4">
                  {product.is_service ? (
                    <span className="text-gray-300">—</span>
                  ) : (
                    <span className={`font-medium ${product.stock_quantity < 5 ? 'text-red-500' : 'text-gray-600'}`}>
                      {product.stock_quantity}
                    </span>
                  )}
                </td>
                <td className="p-4 text-center">
                  {product.badge ? (
                    <span className="px-2 py-0.5 bg-brand-orange/10 text-brand-orange rounded-full text-[10px] font-bold uppercase tracking-wider">
                      {product.badge}
                    </span>
                  ) : <span className="text-gray-300">—</span>}
                </td>
                <td className="p-4 text-center">
                  {product.is_service ? (
                    <Check className="mx-auto text-green-500" size={18} />
                  ) : (
                    <X className="mx-auto text-gray-300" size={18} />
                  )}
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setEditingProduct(product)}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      disabled={isDeleting === product.id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={8} className="p-12 text-center text-gray-500">
                  <Package className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="font-medium">No products found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingProduct && (
        <EditProductModal 
          product={editingProduct}
          categories={categories}
          onClose={() => setEditingProduct(null)}
          onUpdated={onUpdated}
        />
      )}
    </div>
  )
}
