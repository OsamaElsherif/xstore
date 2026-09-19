'use client';

import { useState } from 'react';
import { Category, Subcategory, SubSubcategory, CategoryWithFullTree } from '@/types';
import { Plus, Edit, Trash2, Layers, ChevronDown, ChevronRight, FolderTree, X } from 'lucide-react';
import Image from 'next/image';
import { getProductImageUrl } from '@/lib/supabase/storage';
import { deleteCategory } from '@/lib/actions/categories';
import { deleteSubcategory } from '@/lib/actions/subcategories';
import { deleteSubSubcategory } from '@/lib/actions/sub-subcategories';
import CategoryForm from './CategoryForm';
import SubcategoryForm from './SubcategoryForm';
import SubSubcategoryForm from './SubSubcategoryForm';
import SubSubcategoryProductsPanel from './SubSubcategoryProductsPanel';

interface CategoriesManagerProps {
  initialCategories: (CategoryWithFullTree & { products: { count: number }[] })[];
}

export default function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const [categories, setCategories] = useState(initialCategories);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showSubcategoryForm, setShowSubcategoryForm] = useState<string | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);

  // Sub-subcategories states
  const [expandedSubcategories, setExpandedSubcategories] = useState<string[]>([]);
  const [showSubSubcategoryForm, setShowSubSubcategoryForm] = useState<string | null>(null); // holds subcategoryId
  const [editingSubSubcategory, setEditingSubSubcategory] = useState<SubSubcategory | null>(null);
  const [activeProductsPanel, setActiveProductsPanel] = useState<SubSubcategory | null>(null);

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

  const handleDeleteSubSubcategory = async (subSubcategoryId: string, subcategoryId: string, categoryId: string) => {
    if (!confirm('Are you sure? Products in this series (sub-subcategory) will be unassigned, not deleted.')) return;

    const result = await deleteSubSubcategory(subSubcategoryId);
    if (result.success) {
      setCategories(prev => prev.map(c => {
        if (c.id === categoryId) {
          return {
            ...c,
            subcategories: c.subcategories.map(s => {
              if (s.id === subcategoryId) {
                return {
                  ...s,
                  sub_subcategories: s.sub_subcategories.filter(ss => ss.id !== subSubcategoryId)
                };
              }
              return s;
            })
          };
        }
        return c;
      }));
    } else {
      alert(result.error || 'Failed to delete series (sub-subcategory)');
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
          return {
            ...c,
            subcategories: c.subcategories.map(s =>
              s.id === subcategory.id ? { ...subcategory, sub_subcategories: s.sub_subcategories || [] } : s
            )
          };
        } else {
          return { ...c, subcategories: [...c.subcategories, { ...subcategory, sub_subcategories: [] }] };
        }
      }
      return c;
    }));
    setShowSubcategoryForm(null);
    setEditingSubcategory(null);
  };

  const handleSubSubcategorySuccess = (subSubcategory: SubSubcategory, categoryId: string) => {
    setCategories(prev => prev.map(c => {
      if (c.id === categoryId) {
        return {
          ...c,
          subcategories: c.subcategories.map(s => {
            if (s.id === subSubcategory.subcategory_id) {
              const subSubs = s.sub_subcategories || [];
              if (editingSubSubcategory) {
                return {
                  ...s,
                  sub_subcategories: subSubs.map(ss => ss.id === subSubcategory.id ? subSubcategory : ss)
                };
              } else {
                return {
                  ...s,
                  sub_subcategories: [...subSubs, subSubcategory]
                };
              }
            }
            return s;
          })
        };
      }
      return c;
    }));
    setShowSubSubcategoryForm(null);
    setEditingSubSubcategory(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedCategory(prev => prev === id ? null : id);
  };

  const toggleSubcategoryExpand = (id: string) => {
    setExpandedSubcategories(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
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
                <>
      {/* ── Main category row ── */}
      <tr key={category.id} className="group border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
        
        {/* Expand toggle */}
        <td className="p-4 w-8">
          {subCount > 0 && (
            <button
              onClick={() => toggleExpand(category.id)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
        </td>

        {/* Image */}
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

        {/* EN Name */}
        <td className="p-4 font-semibold text-gray-800">
          {category.name_en}
        </td>

        {/* AR Name */}
        <td className="p-4 font-arabic" dir="rtl">
          {category.name_ar}
        </td>

        {/* Slug */}
        <td className="p-4 text-sm text-gray-500 font-mono">
          {category.slug}
        </td>

        {/* Products count */}
        <td className="p-4 text-center">
          <span className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold">
            {category.products?.[0]?.count || 0}
          </span>
        </td>

        {/* Subcategories count */}
        <td className="p-4 text-center">
          <button
            onClick={() => toggleExpand(category.id)}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
              subCount > 0
                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 cursor-pointer'
                : 'bg-gray-50 text-gray-400 cursor-default'
            }`}
          >
            <FolderTree size={12} className="inline me-1" />
            {subCount}
          </button>
        </td>

        {/* Actions */}
        <td className="p-4">
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setEditingCategory(category); setShowForm(true) }}
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

      {/* ── Expanded subcategories row ── */}
      {isExpanded && (
        <tr key={`${category.id}-expanded`} className="bg-gray-50/50">
          <td colSpan={8} className="px-8 py-4 border-b border-gray-100">
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              
              {/* Header */}
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <FolderTree size={14} />
                  Subcategories
                </h4>
                <button
                  onClick={() => {
                    setEditingSubcategory(null)
                    setShowSubcategoryForm(category.id)
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus size={14} />
                  Add Subcategory
                </button>
              </div>

              {/* Subcategory create/edit form */}
              {showSubcategoryForm === category.id && (
                <SubcategoryForm
                  categoryId={category.id}
                  subcategory={editingSubcategory || undefined}
                  onSuccess={handleSubcategorySuccess}
                  onCancel={() => {
                    setShowSubcategoryForm(null)
                    setEditingSubcategory(null)
                  }}
                />
              )}

              {/* Subcategory list */}
              {category.subcategories.length > 0 ? (
                <div className="space-y-3">
                  {category.subcategories.map(sub => {
                    const isSubExpanded = expandedSubcategories.includes(sub.id);
                    const subSubCount = sub.sub_subcategories?.length || 0;
                    return (
                      <div key={sub.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                        <div
                          className="flex items-center justify-between p-3 hover:bg-gray-50/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {/* Toggle sub-subcategory expansion */}
                            <button
                              onClick={() => toggleSubcategoryExpand(sub.id)}
                              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                            >
                              {isSubExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </button>

                            {/* Subcategory image or initial */}
                            {sub.image_url ? (
                              <div className="relative w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                <Image
                                  src={getProductImageUrl(sub.image_url) || ''}
                                  alt={sub.name_en}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs flex-shrink-0">
                                {sub.name_en.charAt(0).toUpperCase()}
                              </div>
                            )}

                            {/* Names and slug */}
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-bold text-gray-800">{sub.name_en}</p>
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[9px] font-bold">
                                  {subSubCount} series
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-400 font-mono">{sub.slug}</p>
                            </div>

                            {/* Arabic name */}
                            <span
                              className="text-xs text-gray-400 font-arabic ms-2"
                              dir="rtl"
                            >
                              {sub.name_ar}
                            </span>
                          </div>

                          {/* Subcategory actions */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingSubcategory(sub)
                                setShowSubcategoryForm(category.id)
                              }}
                              className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit Subcategory"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteSubcategory(sub.id, category.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete Subcategory"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Expanded sub-subcategories section */}
                        {isSubExpanded && (
                          <div className="px-6 pb-4 pt-2 bg-gray-50/30 border-t border-gray-50 space-y-3">
                            {/* Header */}
                            <div className="flex items-center justify-between">
                              <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                <FolderTree size={12} />
                                Sub-subcategories (Series)
                              </h5>
                              <button
                                onClick={() => {
                                  setEditingSubSubcategory(null);
                                  setShowSubSubcategoryForm(sub.id);
                                }}
                                className="flex items-center gap-1 px-2.5 py-1 bg-indigo-500 text-white text-[10px] font-bold rounded-lg hover:bg-indigo-600 transition-colors"
                              >
                                <Plus size={12} />
                                Add Series
                              </button>
                            </div>

                            {/* Sub-subcategory create/edit form */}
                            {showSubSubcategoryForm === sub.id && (
                              <SubSubcategoryForm
                                subcategoryId={sub.id}
                                subSubcategory={editingSubSubcategory || undefined}
                                onSuccess={(ss) => handleSubSubcategorySuccess(ss, category.id)}
                                onCancel={() => {
                                  setShowSubSubcategoryForm(null);
                                  setEditingSubSubcategory(null);
                                }}
                              />
                            )}

                            {/* Sub-subcategory list */}
                            {sub.sub_subcategories && sub.sub_subcategories.length > 0 ? (
                              <div className="space-y-1.5">
                                {sub.sub_subcategories.map(subsub => (
                                  <div
                                    key={subsub.id}
                                    className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-100 hover:border-indigo-200 transition-colors text-xs"
                                  >
                                    <div className="flex items-center gap-2">
                                      {subsub.image_url ? (
                                        <div className="relative w-6 h-6 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                                          <Image
                                            src={getProductImageUrl(subsub.image_url) || ''}
                                            alt={subsub.name_en}
                                            fill
                                            className="object-cover"
                                          />
                                        </div>
                                      ) : (
                                        <div className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-[10px] flex-shrink-0">
                                          {subsub.name_en.charAt(0).toUpperCase()}
                                        </div>
                                      )}
                                      <div>
                                        <span className="font-bold text-gray-700">{subsub.name_en}</span>
                                        <span className="text-[9px] text-gray-400 font-mono ms-2">({subsub.slug})</span>
                                      </div>
                                      <span className="text-[10px] text-gray-400 font-arabic ms-2" dir="rtl">{subsub.name_ar}</span>
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                      <button
                                        onClick={() => setActiveProductsPanel(subsub)}
                                        className="px-2 py-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded transition-colors"
                                      >
                                        Products
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingSubSubcategory(subsub);
                                          setShowSubSubcategoryForm(sub.id);
                                        }}
                                        className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                        title="Edit Series"
                                      >
                                        <Edit size={12} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteSubSubcategory(subsub.id, sub.id, category.id)}
                                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Delete Series"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[10px] text-gray-400 text-center py-2 italic">
                                No series (sub-subcategories) yet. Add one above.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-400 text-center py-4 italic">
                  No subcategories yet. Add one above.
                </p>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
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

      {/* Product Assignment Modal */}
      {activeProductsPanel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Manage Products: {activeProductsPanel.name_en}
                </h3>
                <p className="text-xs text-gray-400">
                  Assign or remove products for this series (sub-subcategory).
                </p>
              </div>
              <button
                onClick={() => setActiveProductsPanel(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <SubSubcategoryProductsPanel
                subSubcategory={activeProductsPanel}
                onClose={() => setActiveProductsPanel(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
