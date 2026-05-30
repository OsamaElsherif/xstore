'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, Grid3X3, List, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Product, Category } from '@/types';
import ProductCard from './ProductCard';

interface ShopPageProps {
  initialProducts: (Product & { categories: Category | null })[];
  categories: Category[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  currentFilters: {
    categorySlug?: string;
    sortBy?: string;
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
    searchQuery?: string;
  };
}

export default function ShopPage({
  initialProducts,
  categories,
  totalCount,
  totalPages,
  currentPage,
  currentFilters,
}: ShopPageProps) {
  const { t, language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const gridRef = useRef<HTMLDivElement>(null);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Local filter state for inputs
  const [localMinPrice, setLocalMinPrice] = useState(currentFilters.minPrice?.toString() ?? '');
  const [localMaxPrice, setLocalMaxPrice] = useState(currentFilters.maxPrice?.toString() ?? '');

  // Sync local state when URL params change
  useEffect(() => {
    setLocalMinPrice(currentFilters.minPrice?.toString() ?? '');
    setLocalMaxPrice(currentFilters.maxPrice?.toString() ?? '');
  }, [currentFilters.minPrice, currentFilters.maxPrice]);

  // Build URL with updated params
  const buildUrl = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Reset to page 1 when filters change (unless we're specifically changing page)
    if (!('page' in updates)) {
      params.delete('page');
    }

    const queryString = params.toString();
    return `/shop${queryString ? `?${queryString}` : ''}`;
  };

  const handleCategoryChange = (slug?: string) => {
    router.push(buildUrl({ category: slug }));
    setIsDrawerOpen(false);
  };

  const handleSortChange = (sort: string) => {
    router.push(buildUrl({ sort: sort || undefined }));
  };

  const handleApplyPriceRange = () => {
    router.push(buildUrl({
      minPrice: localMinPrice || undefined,
      maxPrice: localMaxPrice || undefined,
    }));
    setIsDrawerOpen(false);
  };

  const handleInStockToggle = () => {
    router.push(buildUrl({
      inStock: currentFilters.inStockOnly ? undefined : 'true',
    }));
  };

  const handleResetAll = () => {
    router.push('/shop');
    setIsDrawerOpen(false);
  };

  const handlePageChange = (page: number) => {
    router.push(buildUrl({ page: page > 1 ? page.toString() : undefined }));
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const removeFilter = (key: string) => {
    router.push(buildUrl({ [key]: undefined }));
  };

  // Active filter chips
  const activeFilters: { key: string; label: string }[] = [];
  if (currentFilters.categorySlug) {
    const cat = categories.find(c => c.slug === currentFilters.categorySlug);
    activeFilters.push({
      key: 'category',
      label: cat ? (language === 'ar' ? cat.name_ar : cat.name_en) : currentFilters.categorySlug,
    });
  }
  if (currentFilters.minPrice !== undefined) {
    activeFilters.push({ key: 'minPrice', label: `${t('minPrice')}: ${t('egp')} ${currentFilters.minPrice.toLocaleString()}` });
  }
  if (currentFilters.maxPrice !== undefined) {
    activeFilters.push({ key: 'maxPrice', label: `${t('maxPrice')}: ${t('egp')} ${currentFilters.maxPrice.toLocaleString()}` });
  }
  if (currentFilters.inStockOnly) {
    activeFilters.push({ key: 'inStock', label: t('inStockOnly') });
  }
  if (currentFilters.searchQuery) {
    activeFilters.push({ key: 'q', label: `"${currentFilters.searchQuery}"` });
  }

  const activeFilterCount = activeFilters.length;

  // Calculate showing range
  const pageSize = 12;
  const showingFrom = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const showingTo = Math.min(currentPage * pageSize, totalCount);

  // Pagination page numbers
  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  // Sidebar content (shared between desktop and mobile drawer)
  const filterContent = (
    <div className="space-y-6">
      {/* Categories */}
      <div className="bg-white rounded-2xl border border-brand-gray/20 p-6">
        <h3 className="font-bold text-brand-dark mb-4 text-sm uppercase tracking-wide">{t('categories')}</h3>
        <div className="space-y-2">
          <button
            onClick={() => handleCategoryChange(undefined)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
              !currentFilters.categorySlug
                ? 'bg-brand-orange/10 text-brand-orange font-bold'
                : 'text-brand-dark/70 hover:bg-brand-light'
            }`}
          >
            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
              !currentFilters.categorySlug ? 'border-brand-orange' : 'border-brand-gray/40'
            }`}>
              {!currentFilters.categorySlug && <span className="w-2 h-2 rounded-full bg-brand-orange" />}
            </span>
            {t('allCategories')} ({totalCount})
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                currentFilters.categorySlug === cat.slug
                  ? 'bg-brand-orange/10 text-brand-orange font-bold'
                  : 'text-brand-dark/70 hover:bg-brand-light'
              }`}
            >
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                currentFilters.categorySlug === cat.slug ? 'border-brand-orange' : 'border-brand-gray/40'
              }`}>
                {currentFilters.categorySlug === cat.slug && <span className="w-2 h-2 rounded-full bg-brand-orange" />}
              </span>
              {language === 'ar' ? cat.name_ar : cat.name_en}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="bg-white rounded-2xl border border-brand-gray/20 p-6">
        <h3 className="font-bold text-brand-dark mb-4 text-sm uppercase tracking-wide">{t('priceRange')}</h3>
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <label className="text-xs text-brand-dark/50 mb-1 block">{t('minPrice')}</label>
            <input
              type="number"
              value={localMinPrice}
              onChange={e => setLocalMinPrice(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 rounded-lg border border-brand-gray/30 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 bg-brand-light/30"
            />
          </div>
          <div className="flex items-end pb-2 text-brand-dark/30">—</div>
          <div className="flex-1">
            <label className="text-xs text-brand-dark/50 mb-1 block">{t('maxPrice')}</label>
            <input
              type="number"
              value={localMaxPrice}
              onChange={e => setLocalMaxPrice(e.target.value)}
              placeholder="50,000"
              className="w-full px-3 py-2 rounded-lg border border-brand-gray/30 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/40 bg-brand-light/30"
            />
          </div>
        </div>
        <button
          onClick={handleApplyPriceRange}
          className="w-full py-2 rounded-xl bg-brand-dark text-brand-light text-sm font-semibold hover:bg-brand-orange hover:text-brand-dark transition-colors"
        >
          {t('applyFilters')}
        </button>
      </div>

      {/* In Stock */}
      <div className="bg-white rounded-2xl border border-brand-gray/20 p-6">
        <button
          onClick={handleInStockToggle}
          className="flex items-center gap-3 w-full"
        >
          <span className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            currentFilters.inStockOnly ? 'bg-brand-orange border-brand-orange' : 'border-brand-gray/40'
          }`}>
            {currentFilters.inStockOnly && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </span>
          <span className="text-sm font-medium text-brand-dark">{t('inStockOnly')}</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={handleResetAll}
          className="w-full py-3 rounded-xl border-2 border-brand-gray/30 text-brand-dark text-sm font-semibold hover:bg-brand-light transition-colors"
        >
          {t('resetAll')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full" ref={gridRef}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl md:text-4xl font-display font-bold text-brand-dark">{t('shopTitle')}</h1>
          <p className="text-sm text-brand-dark/50 hidden sm:block">
            {t('showing')} {showingFrom}–{showingTo} {t('of')} {totalCount} {t('products')}
          </p>
        </div>

        {/* Active Filter Chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {activeFilters.map(filter => (
              <button
                key={filter.key}
                onClick={() => removeFilter(filter.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-medium hover:bg-brand-orange/20 transition-colors"
              >
                {filter.label}
                <X size={14} />
              </button>
            ))}
            <button
              onClick={handleResetAll}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-brand-dark/50 text-sm font-medium hover:text-brand-dark hover:bg-brand-light transition-colors"
            >
              {t('clearAll')}
            </button>
          </div>
        )}

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 shrink-0">
            {filterContent}
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Sort & View Controls */}
            <div className="flex items-center justify-between mb-6 gap-4">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-brand-gray/20 text-sm font-medium text-brand-dark hover:bg-brand-light transition-colors"
              >
                <SlidersHorizontal size={16} />
                {t('filters')}
                {activeFilterCount > 0 && (
                  <span className="bg-brand-orange text-brand-dark text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-brand-dark/50 hidden sm:block">{t('sortBy')}:</label>
                <select
                  value={currentFilters.sortBy || 'newest'}
                  onChange={e => handleSortChange(e.target.value)}
                  className="px-3 py-2.5 rounded-xl border border-brand-gray/20 bg-white text-sm font-medium text-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-orange/40 cursor-pointer"
                >
                  <option value="newest">{t('newest')}</option>
                  <option value="price_asc">{t('priceLowToHigh')}</option>
                  <option value="price_desc">{t('priceHighToLow')}</option>
                  <option value="rating">{t('topRated')}</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center border border-brand-gray/20 rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-brand-dark text-brand-light'
                      : 'bg-white text-brand-dark/50 hover:text-brand-dark'
                  }`}
                  title={t('gridView')}
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2.5 transition-colors ${
                    viewMode === 'list'
                      ? 'bg-brand-dark text-brand-light'
                      : 'bg-white text-brand-dark/50 hover:text-brand-dark'
                  }`}
                  title={t('listView')}
                >
                  <List size={18} />
                </button>
              </div>
            </div>

            {/* Mobile showing count */}
            <p className="text-sm text-brand-dark/50 mb-4 sm:hidden">
              {t('showing')} {showingFrom}–{showingTo} {t('of')} {totalCount} {t('products')}
            </p>

            {/* Products */}
            {initialProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-20 h-20 rounded-full bg-brand-gray/10 flex items-center justify-center mb-4">
                  <SlidersHorizontal size={32} className="text-brand-gray/40" />
                </div>
                <h3 className="font-bold text-brand-dark text-lg mb-2">{t('noProducts')}</h3>
                <p className="text-brand-dark/50 text-sm mb-6 max-w-sm">
                  {t('tryDifferentFilters')}
                </p>
                <button
                  onClick={handleResetAll}
                  className="px-6 py-2.5 rounded-xl bg-brand-dark text-brand-light font-semibold text-sm hover:bg-brand-orange hover:text-brand-dark transition-colors"
                >
                  {t('resetAll')}
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                {initialProducts.map(product => (
                  <ProductCard key={product.id} product={product} view="grid" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {initialProducts.map(product => (
                  <ProductCard key={product.id} product={product} view="list" />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className={`flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    currentPage <= 1
                      ? 'text-brand-dark/20 cursor-not-allowed'
                      : 'text-brand-dark hover:bg-brand-light border border-brand-gray/20'
                  }`}
                >
                  {language === 'ar' ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                  {t('previous')}
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((pageNum, idx) =>
                    pageNum === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-brand-dark/30">…</span>
                    ) : (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum as number)}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${
                          currentPage === pageNum
                            ? 'bg-brand-dark text-brand-light'
                            : 'text-brand-dark/60 hover:bg-brand-light border border-brand-gray/20'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className={`flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    currentPage >= totalPages
                      ? 'text-brand-dark/20 cursor-not-allowed'
                      : 'text-brand-dark hover:bg-brand-light border border-brand-gray/20'
                  }`}
                >
                  {t('next')}
                  {language === 'ar' ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Mobile Filter Drawer */}
      <div
        className={`fixed bottom-0 inset-x-0 z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="bg-brand-light rounded-t-3xl max-h-[85vh] overflow-y-auto">
          {/* Drawer Handle */}
          <div className="flex items-center justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-brand-gray/40" />
          </div>

          {/* Drawer Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-brand-gray/20">
            <h2 className="font-bold text-brand-dark text-lg">{t('filters')}</h2>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="text-brand-dark/50 hover:text-brand-dark transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Drawer Content */}
          <div className="px-6 py-6">
            {filterContent}
          </div>
        </div>
      </div>
    </div>
  );
}
