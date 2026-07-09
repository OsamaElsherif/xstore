'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { Category } from '@/types';
import { getProductImageUrl } from '@/lib/supabase/storage';

interface CategoriesProps {
  categories: Category[];
}

export default function Categories({ categories }: CategoriesProps) {
  const { t, language } = useLanguage();

  return (
    <section className="py-16 md:py-24 bg-brand-light">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-brand-dark mb-2">
              {t('shopByCategory')}
            </h2>
            <p className="text-brand-dark/60">{t('findExactly')}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {categories.map((category) => (
            <Link
              key={category.id} 
              href={`/categories/${category.slug}`}
              className="group relative h-64 md:h-80 rounded-2xl overflow-hidden cursor-pointer"
            >
              <Image
                src={getProductImageUrl(category.image_url) || '/placeholder-product.png'}
                alt={language === 'ar' ? category.name_ar : category.name_en}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/80 via-brand-dark/20 to-transparent transition-opacity group-hover:opacity-90"></div>
              <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 translate-y-2 group-hover:translate-y-0 transition-transform">
                <h3 className="text-brand-light font-bold text-xl md:text-2xl">
                  {language === 'ar' ? category.name_ar : category.name_en}
                </h3>
                <p className="text-brand-orange text-sm opacity-0 group-hover:opacity-100 transition-opacity delay-100">
                  {t('explore')} {language === 'ar' ? '←' : '→'}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
