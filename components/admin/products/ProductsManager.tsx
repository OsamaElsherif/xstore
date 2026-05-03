'use client'

import { useState } from 'react'
import { Product, Category } from '@/types'
import ProductList from './ProductList'
import SingleProductForm from './SingleProductForm'
import BulkImportForm from './BulkImportForm'
import { LayoutGrid, PlusCircle, FileUp } from 'lucide-react'

interface ProductsManagerProps {
  initialProducts: (Product & { category_name_en: string | null })[]
  categories: Category[]
}

export default function ProductsManager({ initialProducts, categories }: ProductsManagerProps) {
  const [products, setProducts] = useState(initialProducts)
  const [activeTab, setActiveTab] = useState<'list' | 'single' | 'bulk'>('list')

  const handleProductCreated = (newProduct: Product) => {
    // Refresh products list (optimistic update or re-fetch)
    // For simplicity, we'll just add it to the local state if category info is handled
    const category = categories.find(c => c.id === newProduct.category_id)
    const productWithCategory = {
      ...newProduct,
      category_name_en: category?.name_en || null
    }
    setProducts([productWithCategory, ...products])
    setActiveTab('list')
  }

  const handleProductUpdated = (updatedProduct: Product) => {
    const category = categories.find(c => c.id === updatedProduct.category_id)
    setProducts(products.map(p => 
      p.id === updatedProduct.id 
        ? { ...updatedProduct, category_name_en: category?.name_en || null } 
        : p
    ))
  }

  const handleProductDeleted = (id: string) => {
    setProducts(products.filter(p => p.id !== id))
  }

  const handleBulkImported = () => {
    // Since bulk import is complex, it's better to reload the page or re-fetch
    window.location.reload()
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === 'list' 
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <LayoutGrid size={18} />
          Product List
        </button>
        <button
          onClick={() => setActiveTab('single')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === 'single' 
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <PlusCircle size={18} />
          Add Single Product
        </button>
        <button
          onClick={() => setActiveTab('bulk')}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
            activeTab === 'bulk' 
              ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/30' 
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FileUp size={18} />
          Bulk Import
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'list' && (
          <ProductList 
            products={products} 
            categories={categories}
            onDeleted={handleProductDeleted}
            onUpdated={handleProductUpdated}
          />
        )}
        {activeTab === 'single' && (
          <SingleProductForm 
            categories={categories} 
            onCreated={handleProductCreated}
          />
        )}
        {activeTab === 'bulk' && (
          <BulkImportForm 
            categories={categories} 
            onImported={handleBulkImported}
          />
        )}
      </div>
    </div>
  )
}
