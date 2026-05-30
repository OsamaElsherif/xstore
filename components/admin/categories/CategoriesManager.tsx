'use client';

import { useState } from 'react';
import { Category, Subcategory, CategoryWithSubcategories } from '@/types';
import { Plus, Edit, Trash2, Layers, ChevronDown, ChevronRight, FolderTree } from 'lucide-react';
import Image from 'next/image';
import { getProductImageUrl } from '@/lib/supabase/storage';
import { deleteCategory } from '@/lib/actions/categories';
import { deleteSubcategory } from '@/lib/actions/subcategories';
import CategoryForm from './CategoryForm';
import SubcategoryForm from './SubcategoryForm';

interface CategoriesManagerProps {
  initialCategories: (CategoryWithSubcategories & { products: { count: number }[] })[];
}

export default function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showSubcategoryForm, setShowSubcategoryForm] = useState<string | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);

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

  const handleDeleteSubcategory = async (subcategoryId: string, categoryId: string) => {
    if (!confirm('Are you sure? Products in this subcategory will be unassigned, not deleted.')) return;

    const result = await deleteSubcategory(subcategoryId);
    if (result.success) {
      setCategories(prev => prev.map(c => {
        if (c.id === categoryId) {
          return { ...c, subcategories: c.subcategories.filter(s => s.id !== subcategoryId) };
        }
        return c;
      }));
    } else {
      alert(result.error || 'Failed to delete subcategory');
    }
  };

  const handleSuccess = (newCategory: Category) => {
    if (editingCategory) {
      setCategories(prev => prev.map(c => c.id === newCategory.id ? { ...newCategory, products: c.products, subcategories: c.subcategories } : c));
    } else {
      setCategories(prev => [{ ...newCategory, products: [{ count: 0 }], subcategories: [] }, ...prev]);
    }
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleSubcategorySuccess = (subcategory: Subcategory) => {
    setCategories(prev => prev.map(c => {
      if (c.id === subcategory.category_id) {
        if (editingSubcategory) {
          return { ...c, subcategories: c.subcategories.map(s => s.id === subcategory.id ? subcategory : s) };
        } else {
          return { ...c, subcategories: [...c.subcategories, subcategory] };
        }
      }
      return c;
    }));
    setShowSubcategoryForm(null);
    setEditingSubcategory(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedCategory(prev => prev === id ? null : id);
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
              <th className="p-4 font-medium w-8"></th>
              <th className="p-4 font-medium">Image</th>
              <th className="p-4 font-medium">EN Name</th>
              <th className="p-4 font-medium">AR Name</th>
              <th className="p-4 font-medium">Slug</th>
              <th className="p-4 font-medium text-center">Products</th>
              <th className="p-4 font-medium text-center">Subs</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((category) => {
              const isExpanded = expandedCategory === category.id;
              const subCount = category.subcategories?.length || 0;

              return (
                <tr key={category.id} className="group">
                  <td colSpan={8} className="p-0">
                    {/* Main category row */}
                    <div className="flex items-center hover:bg-gray-50 transition-colors">
                      <div className="p-4 w-8">
                        {subCount > 0 && (
                          <button
                            onClick={() => toggleExpand(category.id)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          </button>
                        )}
                      </div>
                      <div className="p-4">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                          <Image 
                            src={getProductImageUrl(category.image_url) || '/placeholder-product.png'} 
                            alt={category.name_en}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                      <div className="p-4 font-semibold text-gray-800 flex-1">{category.name_en}</div>
                      <div className="p-4 font-arabic flex-1" dir="rtl">{category.name_ar}</div>
                      <div className="p-4 text-sm text-gray-500 flex-1">{category.slug}</div>
                      <div className="p-4 text-center">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold">
                          {category.products?.[0]?.count || 0}
                        </span>
                      </div>
                      <div className="p-4 text-center">
                        <button
                          onClick={() => toggleExpand(category.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                            subCount > 0
                              ? 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                              : 'bg-gray-50 text-gray-400'
                          }`}
                        >
                          <FolderTree size={12} className="inline me-1" />
                          {subCount}
                        </button>
                      </div>
                      <div className="p-4 text-right">
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
                      </div>
                    </div>

                    {/* Expanded subcategories panel */}
                    {isExpanded && (
                      <div className="bg-gray-50/50 border-t border-gray-100 px-8 py-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <FolderTree size={14} />
                            Subcategories
                          </h4>
                          <button
                            onClick={() => { setEditingSubcategory(null); setShowSubcategoryForm(category.id); }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-orange-500 text-slate-900 text-xs font-bold rounded-lg hover:bg-orange-600 transition-colors"
                          >
                            <Plus size={14} />
                            Add Subcategory
                          </button>
                        </div>

                        {showSubcategoryForm === category.id && (
                          <SubcategoryForm
                            categoryId={category.id}
                            subcategory={editingSubcategory || undefined}
                            onSuccess={handleSubcategorySuccess}
                            onCancel={() => { setShowSubcategoryForm(null); setEditingSubcategory(null); }}
                          />
                        )}

                        {category.subcategories.length > 0 ? (
                          <div className="space-y-2">
                            {category.subcategories.map(sub => (
                              <div key={sub.id} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 hover:border-orange-200 transition-colors">
                                <div className="flex items-center gap-3">
                                  {sub.image_url ? (
                                    <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-gray-100">
                                      <Image src={getProductImageUrl(sub.image_url) || ''} alt={sub.name_en} fill className="object-cover" />
                                    </div>
                                  ) : (
                                    <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 font-black text-xs">
                                      {sub.name_en.charAt(0)}
                                    </div>
                                  )}
                                  <div>
                                    <p className="text-sm font-bold text-gray-800">{sub.name_en}</p>
                                    <p className="text-[10px] text-gray-400 font-mono">{sub.slug}</p>
                                  </div>
                                  <span className="text-xs text-gray-400 font-arabic ms-2" dir="rtl">{sub.name_ar}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => { setEditingSubcategory(sub); setShowSubcategoryForm(category.id); }}
                                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSubcategory(sub.id, category.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 text-center py-4 italic">No subcategories yet. Add one above.</p>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {categories.length === 0 && (
              <tr>
                <td colSpan={8} className="p-12 text-center text-gray-500">
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
