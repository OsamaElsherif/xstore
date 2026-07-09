'use client';

import { useState } from 'react';
import { Subcategory } from '@/types';
import { Loader2 } from 'lucide-react';
import { createSubcategory, updateSubcategory } from '@/lib/actions/subcategories';
import ImageUploader from '../products/ImageUploader';
import { uploadProductImage } from '@/lib/supabase/storage';

interface SubcategoryFormProps {
  categoryId: string;
  subcategory?: Subcategory;
  onSuccess: (s: Subcategory) => void;
  onCancel: () => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function SubcategoryForm({ categoryId, subcategory, onSuccess, onCancel }: SubcategoryFormProps) {
  const isEdit = !!subcategory;
  const [nameEn, setNameEn] = useState(subcategory?.name_en || '');
  const [nameAr, setNameAr] = useState(subcategory?.name_ar || '');
  const [slug, setSlug] = useState(subcategory?.slug || '');
  const [imageUrl, setImageUrl] = useState<string | null>(subcategory?.image_url || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
      let nextImageUrl = imageUrl;

      if (selectedFile) {
        nextImageUrl = await uploadProductImage(selectedFile);
      }

      if (isEdit) {
        const result = await updateSubcategory(subcategory!.id, {
          name_en: nameEn,
          name_ar: nameAr,
          slug,
          image_url: nextImageUrl,
        });
        if (result.success) {
          onSuccess({ ...subcategory!, name_en: nameEn, name_ar: nameAr, slug, image_url: nextImageUrl });
        } else {
          setError(result.error || 'Failed to update subcategory');
        }
      } else {
        const result = await createSubcategory({
          category_id: categoryId,
          name_en: nameEn,
          name_ar: nameAr,
          slug,
          image_url: nextImageUrl,
        });
        if (result.success && result.subcategory) {
          onSuccess(result.subcategory);
        } else {
          setError(result.error || 'Failed to create subcategory');
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
      <h4 className="text-sm font-black text-gray-900 uppercase tracking-wider">
        {isEdit ? 'Edit Subcategory' : 'New Subcategory'}
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
            placeholder="e.g. Apple"
            value={nameEn}
            onChange={(e) => handleNameEnChange(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Name (Arabic)*</label>
          <input
            type="text"
            required
            placeholder="e.g. أبل"
            dir="rtl"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-arabic"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Slug*</label>
          <input
            type="text"
            required
            placeholder="e.g. apple"
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setAutoSlug(false); }}
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-mono"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-bold text-gray-500">Image</label>
        <ImageUploader
          currentImageUrl={imageUrl}
          onFileSelected={(file) => {
            setSelectedFile(file);
            if (!file && !subcategory?.image_url) {
              setImageUrl(null);
            }
          }}
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 text-sm font-bold bg-orange-500 text-slate-900 rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSubmitting && <Loader2 className="animate-spin" size={14} />}
          {isEdit ? 'Save Changes' : 'Create Subcategory'}
        </button>
      </div>
    </form>
  );
}
