'use client';

import { useState } from 'react';
import { Filter } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import FeaturedProducts from '@/components/FeaturedProducts';
import { useLanguage } from '@/contexts/LanguageContext';
import { Product, Category } from '@/types';

interface HomeClientProps {
  featuredProducts: {
    phones: Product[];
    accessories: Product[];
    vapes: Product[];
  };
  categories: Category[];
}

export default function HomeClient({ featuredProducts, categories }: HomeClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { t } = useLanguage();

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 w-full">
      <div className="flex justify-start mb-6">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="flex items-center gap-2 bg-white border border-brand-gray/20 px-4 py-2 rounded-lg font-medium text-brand-dark hover:bg-brand-gray/5 transition-colors shadow-sm"
        >
          <Filter size={20} />
          {isSidebarOpen ? t('hideCategories' as any) : t('showCategories' as any)}
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full">
        {isSidebarOpen && <Sidebar categories={categories} />}
        <div className="flex-1 min-w-0">
          <FeaturedProducts 
            id="mobile-phones"
            titleKey="mobilePhones" 
            subtitleKey="mobilePhonesDesc"
            products={featuredProducts.phones}
            viewAllTextKey="viewAllPhones"
          />
          <FeaturedProducts 
            id="phone-accessories"
            titleKey="phoneAccessories" 
            subtitleKey="phoneAccessoriesDesc"
            products={featuredProducts.accessories}
            viewAllTextKey="viewAllAccessories"
          />
          <FeaturedProducts 
            id="vape-accessories"
            titleKey="vapeAccessories" 
            subtitleKey="vapeAccessoriesDesc"
            products={featuredProducts.vapes}
            viewAllTextKey="viewAllVape"
          />
        </div>
      </div>
    </div>
  );
}
