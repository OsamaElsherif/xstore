'use client';

import { useLanguage } from '@/contexts/LanguageContext';
import { Smartphone, Headphones, Wind, Package } from 'lucide-react';
import { Category } from '@/types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  categories: Category[];
}

export default function Sidebar({ categories }: SidebarProps) {
  const { t, language } = useLanguage();
  const pathname = usePathname();

  const getIcon = (slug: string) => {
    switch (slug) {
      case 'mobile-phones': return <Smartphone size={20} />;
      case 'phone-accessories': return <Headphones size={20} />;
      case 'vape-accessories': return <Wind size={20} />;
      default: return <Package size={20} />;
    }
  };

  return (
    <aside className="w-full md:w-64 shrink-0">
      <div className="sticky top-24 bg-white p-6 rounded-2xl border border-brand-gray/20 shadow-sm">
        <h3 className="font-bold text-xl mb-6 text-brand-dark">{t('shopByCategory')}</h3>
        <ul className="space-y-2">
          {categories.map((category) => {
            const isActive = pathname === `/categories/${category.slug}`;
            return (
              <li key={category.id}>
                <Link 
                  href={`/categories/${category.slug}`} 
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${
                    isActive 
                      ? 'text-brand-orange bg-brand-orange/5' 
                      : 'text-brand-gray hover:text-brand-orange hover:bg-brand-orange/5'
                  }`}
                >
                  {getIcon(category.slug)}
                  {language === 'ar' ? category.name_ar : category.name_en}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
