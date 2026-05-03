'use client';

import { useState } from 'react';
import { Category } from '@/types';
import { Plus, Edit, Trash2, Package, Layers } from 'lucide-react';
import Image from 'next/image';
import { getProductImageUrl } from '@/lib/supabase/storage';
import { deleteCategory } from '@/lib/actions/categories';
import CategoryForm from './CategoryForm';

interface CategoriesManagerProps {
  initialCategories: (Category & { products: { count: number }[] })[];
}

export default function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const handleDelete = async (id: string) => {
    const category = categories.find(c => c.id === id);
    const productCount = category?.products?.[0]?.count || 0;

    if (productCount > 0) {
      alert(`Cannot delete category "${category?.name_en}". It has ${productCount} products. Please reassign or delete them first.`);
      return;
    }

    if (!confirm(`Are you sure you want to delete category "${category?.name_en}"?`)) return;

    const result = await deleteCategory(id);
    if (result.success) {
      setCategories(prev => prev.filter(c => c.id !== id));
    } else {
      alert(result.error || 'Failed to delete category');
    }
  };

  const handleSuccess = (newCategory: Category) => {
    if (editingCategory) {
      setCategories(prev => prev.map(c => c.id === newCategory.id ? { ...newCategory, products: c.products } : c));
    } else {
      setCategories(prev => [{ ...newCategory, products: [{ count: 0 }] }, ...prev]);
    }
    setShowForm(false);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={() => { setEditingCategory(null); setShowForm(!showForm); }}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          {showForm ? 'Cancel' : (
            <>
              <Plus size={20} />
              New Category
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
          <CategoryForm 
            category={editingCategory || undefined}
            onSuccess={handleSuccess}
            onCancel={() => { setShowForm(false); setEditingCategory(null); }}
          />
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
              <th className="p-4 font-medium">Image</th>
              <th className="p-4 font-medium">EN Name</th>
              <th className="p-4 font-medium">AR Name</th>
              <th className="p-4 font-medium">Slug</th>
              <th className="p-4 font-medium text-center">Products</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((category) => (
              <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                    <Image 
                      src={getProductImageUrl(category.image_url) || '/placeholder-product.png'} 
                      alt={category.name_en}
                      fill
                      className="object-cover"
                    />
                  </div>
                </td>
                <td className="p-4 font-semibold text-gray-800">{category.name_en}</td>
                <td className="p-4 font-arabic" dir="rtl">{category.name_ar}</td>
                <td className="p-4 text-sm text-gray-500">{category.slug}</td>
                <td className="p-4 text-center">
                  <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold">
                    {category.products?.[0]?.count || 0}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => { setEditingCategory(category); setShowForm(true); }}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center text-gray-500">
                  <Layers className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="font-medium">No categories found</p>
                  <p className="text-sm">Start by creating your first category.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
