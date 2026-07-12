'use client';

import { Product, Offer } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import { SearchX, ArrowRight } from 'lucide-react';
import ProductCard from '@/components/shop/ProductCard';

interface SearchResultsPageProps {
  query: string;
  initialResults: (Product & { active_offer?: Offer | null; discounted_price?: number | null })[];
}

export default function SearchResultsPage({ query, initialResults }: SearchResultsPageProps) {
  const { t, language } = useLanguage();

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-brand-gray/10 pb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-brand-dark mb-2">
            Search Results for: <span className="text-brand-orange">"{query}"</span>
          </h1>
          <p className="text-brand-dark/60 font-medium">
            We found <span className="text-brand-dark font-bold">{initialResults.length}</span> products matching your search.
          </p>
        </div>
      </div>

      {initialResults.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {initialResults.map((product) => (
            <ProductCard key={product.id} product={product as any} view="grid" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-[3rem] border border-brand-gray/10 shadow-sm">
          <div className="w-24 h-24 bg-brand-light rounded-full flex items-center justify-center mb-8">
            <SearchX size={48} className="text-brand-gray/40" />
          </div>
          <h3 className="text-3xl font-display font-bold text-brand-dark mb-4">No results found</h3>
          <p className="text-brand-gray max-w-sm mx-auto mb-10 leading-relaxed">
            We couldn't find any products matching <span className="font-bold text-brand-dark">"{query}"</span>. 
            Try checking for typos or searching for more general terms like "iPhone" or "Case".
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center gap-3 bg-brand-dark text-brand-light px-10 py-4 rounded-[1.5rem] font-bold hover:bg-brand-orange hover:text-brand-dark transition-all group"
          >
            Browse Categories
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      )}
    </div>
  );
}
