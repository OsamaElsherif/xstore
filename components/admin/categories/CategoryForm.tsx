'use client';

import { useState, useEffect } from 'react';
import { Category } from '@/types';
import { Save, AlertCircle, RefreshCw } from 'lucide-react';
import { createCategory, updateCategory } from '@/lib/actions/categories';
import ImageUploader from '../products/ImageUploader';
import { uploadProductImage } from '@/lib/supabase/storage';

interface CategoryFormProps {
  category?: Category;
  onSuccess: (category: Category) => void;
  onCancel: () => void;
}

export default function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name_en: category?.name_en || '',
    name_ar: category?.name_ar || '',
    slug: category?.slug || '',
    image_url: category?.image_url || null,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate slug from name_en
  useEffect(() => {
    if (!category && formData.name_en) {
      const generatedSlug = formData.name_en
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name_en, category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let currentImageUrl = formData.image_url;

      if (imageFile) {
        currentImageUrl = await uploadProductImage(imageFile);
      }

      const payload = {
        ...formData,
        image_url: currentImageUrl
      };

      if (category) {
        const result = await updateCategory(category.id, payload);
        if (result.success) {
          onSuccess({ ...category, ...payload });
        } else {
          setError(result.error || 'Failed to update category');
        }
      } else {
        const result = await createCategory(payload);
        if (result.success && result.category) {
          onSuccess(result.category);
        } else {
          setError(result.error || 'Failed to create category');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">
          {category ? 'Edit Category' : 'Create New Category'}
        </h3>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name (English)*</label>
            <input 
              type="text" 
              required
              value={formData.name_en}
              onChange={e => setFormData(prev => ({ ...prev, name_en: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Mobile Phones"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 text-right font-arabic">الاسم (بالعربية)*</label>
            <input 
              type="text" 
              required
              dir="rtl"
              value={formData.name_ar}
              onChange={e => setFormData(prev => ({ ...prev, name_ar: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-arabic"
              placeholder="مثال: الهواتف المحمولة"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Slug*</label>
            <div className="relative">
              <input 
                type="text" 
                required
                value={formData.slug}
                onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none pr-10"
                placeholder="mobile-phones"
                pattern="^[a-z0-9-]+$"
              />
              <RefreshCw 
                size={16} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={() => {
                  const generatedSlug = formData.name_en.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
                  setFormData(prev => ({ ...prev, slug: generatedSlug }));
                }}
              />
            </div>
            <p className="mt-1 text-[10px] text-gray-400">Lowercase letters, numbers, and hyphens only.</p>
          </div>
        </div>

        {/* Image */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Category Image</label>
          <ImageUploader 
            currentImageUrl={formData.image_url}
            onFileSelected={setImageFile}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <button 
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              {category ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <Save size={18} />
              {category ? 'Update Category' : 'Create Category'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
