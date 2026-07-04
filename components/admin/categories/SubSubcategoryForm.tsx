'use client';

import { useState } from 'react';
import { SubSubcategory } from '@/types';
import { Loader2 } from 'lucide-react';
import { createSubSubcategory, updateSubSubcategory } from '@/lib/actions/sub-subcategories';

interface SubSubcategoryFormProps {
  subcategoryId: string;
  subSubcategory?: SubSubcategory;
  onSuccess: (s: SubSubcategory) => void;
  onCancel: () => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function SubSubcategoryForm({ subcategoryId, subSubcategory, onSuccess, onCancel }: SubSubcategoryFormProps) {
  const isEdit = !!subSubcategory;
  const [nameEn, setNameEn] = useState(subSubcategory?.name_en || '');
  const [nameAr, setNameAr] = useState(subSubcategory?.name_ar || '');
  const [slug, setSlug] = useState(subSubcategory?.slug || '');
  const [autoSlug, setAutoSlug] = useState(!isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameEnChange = (value: string) => {
    setNameEn(value);
    if (autoSlug) {
      setSlug(slugify(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (isEdit) {
        const result = await updateSubSubcategory(subSubcategory!.id, {
          name_en: nameEn,
          name_ar: nameAr,
          slug,
        });
        if (result.success) {
          onSuccess({ ...subSubcategory!, name_en: nameEn, name_ar: nameAr, slug });
        } else {
          setError(result.error || 'Failed to update series');
        }
      } else {
        const result = await createSubSubcategory({
          subcategory_id: subcategoryId,
          name_en: nameEn,
          name_ar: nameAr,
          slug,
        });
        if (result.success && result.subSubcategory) {
          onSuccess(result.subSubcategory);
        } else {
          setError(result.error || 'Failed to create series');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
      <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider">
        {isEdit ? 'Edit Series (Sub-subcategory)' : 'New Series (Sub-subcategory)'}
      </h4>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Name (English)*</label>
          <input
            type="text"
            required
            placeholder="e.g. S Series"
            value={nameEn}
            onChange={(e) => handleNameEnChange(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Name (Arabic)*</label>
          <input
            type="text"
            required
            placeholder="e.g. فئة اس"
            dir="rtl"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-arabic"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Slug*</label>
          <input
            type="text"
            required
            placeholder="e.g. s-series"
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setAutoSlug(false); }}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-mono"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="animate-spin" size={14} />}
          {isEdit ? 'Save Changes' : 'Create Series'}
        </button>
      </div>
    </form>
  );
}
