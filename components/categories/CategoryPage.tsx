'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star, Filter, ArrowUpDown, PackageX, Search, ChevronRight, Home, Grid3X3 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { Product, Category, Subcategory, SubSubcategory, ProductWithRelations } from '@/types';
import { getProductImageUrl } from '@/lib/supabase/storage';
import WishlistButton from '../products/WishlistButton';

interface CategoryPageProps {
  initialProducts: ProductWithRelations[];
  category: Category;
  subcategory?: Subcategory;
  subSubcategory?: SubSubcategory;
  subcategories?: Subcategory[];
  subSubcategories?: SubSubcategory[];
}

type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'rating';

export default function CategoryPage({ initialProducts, category, subcategory, subSubcategory, subcategories, subSubcategories }: CategoryPageProps) {
  const [products, setProducts] = useState(initialProducts);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { t, language } = useLanguage();
  const { addToCart } = useCart();

  const categoryName = language === 'ar' ? category.name_ar : category.name_en;
  const subcategoryName = subcategory ? (language === 'ar' ? subcategory.name_ar : subcategory.name_en) : null;
  const subSubcategoryName = subSubcategory ? (language === 'ar' ? subSubcategory.name_ar : subSubcategory.name_en) : null;
  const pageName = subSubcategoryName || subcategoryName || categoryName;

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...initialProducts];

    // 1. Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name_en.toLowerCase().includes(q) || 
        p.name_ar.toLowerCase().includes(q)
      );
    }

    // 2. Filters
    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (inStockOnly) {
      result = result.filter(p => (p.stock_quantity !== null && p.stock_quantity > 0) || p.is_service);
    }

    // 3. Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc': return a.price - b.price;
        case 'price_desc': return b.price - a.price;
        case 'rating': return (b.rating || 0) - (a.rating || 0);
        case 'newest': return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        default: return 0;
      }
    });

    return result;
  }, [initialProducts, sortBy, priceRange, inStockOnly, searchQuery]);

  return (
    <div className="space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-brand-dark/50 font-medium">
        <Link href="/" className="hover:text-brand-orange transition-colors flex items-center gap-1">
          <Home size={14} />
          Home
        </Link>
        <ChevronRight size={14} />
        {subSubcategory ? (
          <>
            <Link href={`/categories/${category.slug}`} className="hover:text-brand-orange transition-colors">
              {categoryName}
            </Link>
            <ChevronRight size={14} />
            <Link href={`/categories/${category.slug}/${subcategory?.slug}`} className="hover:text-brand-orange transition-colors">
              {subcategoryName}
            </Link>
            <ChevronRight size={14} />
            <span className="text-brand-dark font-bold">{subSubcategoryName}</span>
          </>
        ) : subcategory ? (
          <>
            <Link href={`/categories/${category.slug}`} className="hover:text-brand-orange transition-colors">
              {categoryName}
            </Link>
            <ChevronRight size={14} />
            <span className="text-brand-dark font-bold">{subcategoryName}</span>
          </>
        ) : (
          <span className="text-brand-dark font-bold">{categoryName}</span>
        )}
      </nav>

      {/* Banner */}
      <div className="relative h-64 md:h-80 rounded-3xl overflow-hidden bg-brand-dark">
        <Image 
          src={getProductImageUrl(subSubcategory?.image_url || subcategory?.image_url || category.image_url) || '/placeholder-category.png'}
          alt={pageName}
          fill
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">{pageName}</h1>
          <p className="text-brand-light/80 max-w-xl text-lg">
            Explore our curated collection of {pageName.toLowerCase()} and find the perfect match for your needs.
          </p>
        </div>
      </div>

      {/* Subcategory Strip — only on parent category page */}
      {!subcategory && subcategories && subcategories.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-brand-dark flex items-center gap-2">
            <Grid3X3 size={20} className="text-brand-orange" />
            Browse by Brand
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {subcategories.map((sub) => {
              const subName = language === 'ar' ? sub.name_ar : sub.name_en;
              const subProductCount = initialProducts.filter(p => p.subcategory_id === sub.id).length;
              return (
                <Link
                  key={sub.id}
                  href={`/categories/${category.slug}/${sub.slug}`}
                  className="group bg-white rounded-2xl border border-brand-gray/10 p-5 flex flex-col items-center text-center hover:shadow-xl hover:shadow-brand-dark/5 hover:border-brand-orange/20 transition-all duration-300"
                >
                  <div className="relative w-16 h-16 rounded-2xl bg-brand-light/50 overflow-hidden mb-3 group-hover:scale-110 transition-transform">
                    {sub.image_url ? (
                      <Image
                        src={getProductImageUrl(sub.image_url) || ''}
                        alt={subName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-orange text-2xl font-black">
                        {subName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-bold text-brand-dark group-hover:text-brand-orange transition-colors">{subName}</p>
                  <p className="text-[10px] text-brand-dark/40 font-bold mt-1">({subProductCount})</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-subcategory Strip — only on subcategory page (subcategory set, no subSubcategory set) */}
      {subcategory && !subSubcategory && subSubcategories && subSubcategories.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-brand-dark flex items-center gap-2">
            <Grid3X3 size={20} className="text-brand-orange" />
            {language === 'ar' ? 'تصفح حسب السلسلة' : 'Browse by Series'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {subSubcategories.map((subsub) => {
              const subsubName = language === 'ar' ? subsub.name_ar : subsub.name_en;
              const subsubProductCount = initialProducts.filter(p => p.sub_subcategory_id === subsub.id).length;
              return (
                <Link
                  key={subsub.id}
                  href={`/categories/${category.slug}/${subcategory.slug}/${subsub.slug}`}
                  className="group bg-white rounded-2xl border border-brand-gray/10 p-5 flex flex-col items-center text-center hover:shadow-xl hover:shadow-brand-dark/5 hover:border-brand-orange/20 transition-all duration-300"
                >
                  <div className="relative w-16 h-16 rounded-2xl bg-brand-light/50 overflow-hidden mb-3 group-hover:scale-110 transition-transform">
                    {subsub.image_url ? (
                      <Image
                        src={getProductImageUrl(subsub.image_url) || ''}
                        alt={subsubName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-orange text-2xl font-black font-display">
                        {subsubName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-bold text-brand-dark group-hover:text-brand-orange transition-colors">{subsubName}</p>
                  <p className="text-[10px] text-brand-dark/40 font-bold mt-1">({subsubProductCount})</p>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 shrink-0 space-y-8">
          <div>
            <h3 className="text-lg font-bold text-brand-dark mb-4 flex items-center gap-2">
              <Filter size={18} /> Filters
            </h3>
            
            <div className="space-y-6 bg-white p-6 rounded-2xl border border-brand-gray/10 shadow-sm">
              {/* Subcategory Links in Sidebar — on parent category page */}
              {!subcategory && subcategories && subcategories.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-bold text-brand-dark/60 uppercase tracking-wider">Filter by Brand</label>
                  <div className="space-y-1">
                    <Link 
                      href={`/categories/${category.slug}`}
                      className="block px-3 py-2 rounded-xl text-sm font-bold text-brand-orange bg-brand-orange/10"
                    >
                      All ({initialProducts.length})
                    </Link>
                    {subcategories.map(sub => {
                      const subName = language === 'ar' ? sub.name_ar : sub.name_en;
                      const count = initialProducts.filter(p => p.subcategory_id === sub.id).length;
                      return (
                        <Link
                          key={sub.id}
                          href={`/categories/${category.slug}/${sub.slug}`}
                          className="block px-3 py-2 rounded-xl text-sm font-medium text-brand-dark/60 hover:text-brand-orange hover:bg-brand-orange/5 transition-colors"
                        >
                          {subName} ({count})
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Subcategory sidebar — when on a subcategory page, show siblings */}
              {subcategory && subcategories && subcategories.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-bold text-brand-dark/60 uppercase tracking-wider">Filter by Brand</label>
                  <div className="space-y-1">
                    <Link 
                      href={`/categories/${category.slug}`}
                      className="block px-3 py-2 rounded-xl text-sm font-medium text-brand-dark/60 hover:text-brand-orange hover:bg-brand-orange/5 transition-colors"
                    >
                      All
                    </Link>
                    {subcategories.map(sub => {
                      const subName = language === 'ar' ? sub.name_ar : sub.name_en;
                      const isActive = sub.id === subcategory.id;
                      return (
                        <Link
                          key={sub.id}
                          href={`/categories/${category.slug}/${sub.slug}`}
                          className={`block px-3 py-2 rounded-xl text-sm font-bold transition-colors ${
                            isActive 
                              ? 'text-brand-orange bg-brand-orange/10' 
                              : 'text-brand-dark/60 hover:text-brand-orange hover:bg-brand-orange/5'
                          }`}
                        >
                          {subName}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sub-subcategory sidebar section */}
              {subcategory && subSubcategories && subSubcategories.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-bold text-brand-dark/60 uppercase tracking-wider">
                    {language === 'ar' ? 'تصفح حسب السلسلة' : 'Filter by Series'}
                  </label>
                  <div className="space-y-1">
                    <Link 
                      href={`/categories/${category.slug}/${subcategory.slug}`}
                      className={`block px-3 py-2 rounded-xl text-sm font-bold transition-colors ${
                        !subSubcategory 
                          ? 'text-brand-orange bg-brand-orange/10' 
                          : 'text-brand-dark/60 hover:text-brand-orange hover:bg-brand-orange/5'
                      }`}
                    >
                      {language === 'ar' ? 'الكل' : 'All'} {!subSubcategory ? `(${initialProducts.length})` : ''}
                    </Link>
                    {subSubcategories.map(subsub => {
                      const subsubName = language === 'ar' ? subsub.name_ar : subsub.name_en;
                      const isActive = subSubcategory && subsub.id === subSubcategory.id;
                      const count = initialProducts.filter(p => p.sub_subcategory_id === subsub.id).length;
                      return (
                        <Link
                          key={subsub.id}
                          href={`/categories/${category.slug}/${subcategory.slug}/${subsub.slug}`}
                          className={`block px-3 py-2 rounded-xl text-sm font-bold transition-colors ${
                            isActive 
                              ? 'text-brand-orange bg-brand-orange/10' 
                              : 'text-brand-dark/60 hover:text-brand-orange hover:bg-brand-orange/5'
                          }`}
                        >
                          {subsubName} {!subSubcategory ? `(${count})` : ''}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Search within category */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-brand-dark/60 uppercase tracking-wider">Search</label>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray" />
                  <input 
                    type="text"
                    placeholder="Search in items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-brand-light/30 border border-brand-gray/10 rounded-xl text-sm focus:ring-2 focus:ring-brand-orange outline-none"
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-brand-dark/60 uppercase tracking-wider">Price Range</label>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="number" 
                    placeholder="Min"
                    value={priceRange[0] || ''}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="w-full px-3 py-2 bg-brand-light/30 border border-brand-gray/10 rounded-xl text-sm outline-none"
                  />
                  <input 
                    type="number" 
                    placeholder="Max"
                    value={priceRange[1] || ''}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="w-full px-3 py-2 bg-brand-light/30 border border-brand-gray/10 rounded-xl text-sm outline-none"
                  />
                </div>
              </div>

              {/* In Stock Only */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input 
                    type="checkbox" 
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-brand-gray/20 rounded-full peer peer-checked:bg-brand-orange transition-colors"></div>
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-4 transition-transform"></div>
                </div>
                <span className="text-sm font-medium text-brand-dark group-hover:text-brand-orange transition-colors">In Stock Only</span>
              </label>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 space-y-8">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-brand-dark/60 font-medium">
              Showing <span className="text-brand-dark font-bold">{filteredAndSortedProducts.length}</span> products
            </p>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-brand-dark/60 font-medium whitespace-nowrap">Sort by:</span>
              <div className="relative">
                <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray" />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="pl-9 pr-8 py-2 bg-white border border-brand-gray/10 rounded-xl text-sm font-bold text-brand-dark focus:ring-2 focus:ring-brand-orange outline-none appearance-none cursor-pointer shadow-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {filteredAndSortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAndSortedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-brand-gray/10 shadow-sm">
              <div className="w-20 h-20 bg-brand-light rounded-full flex items-center justify-center mb-6">
                <PackageX size={40} className="text-brand-gray/40" />
              </div>
              <h3 className="text-2xl font-display font-bold text-brand-dark mb-2">No products found</h3>
              <p className="text-brand-gray max-w-xs mx-auto">
                Try adjusting your filters or search query to find what you're looking for.
              </p>
              <button 
                onClick={() => { setSearchQuery(''); setPriceRange([0, 100000]); setInStockOnly(false); }}
                className="mt-6 text-brand-orange font-bold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { t, language } = useLanguage();
  const { addToCart } = useCart();
  const name = language === 'ar' ? product.name_ar : product.name_en;
  
  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-brand-gray/10 hover:shadow-2xl hover:shadow-brand-dark/5 transition-all duration-500 flex flex-col h-full relative">
      {/* Badge */}
      {product.badge && (
        <div className="absolute top-4 ltr:left-4 rtl:right-4 z-10 bg-brand-orange text-brand-dark text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tighter shadow-sm">
          {product.badge}
        </div>
      )}

      {/* Wishlist Button */}
      <WishlistButton 
        productId={product.id} 
        size="sm" 
        className="absolute top-4 ltr:right-4 rtl:left-4 z-10 p-2.5 bg-white/80 backdrop-blur-md rounded-xl shadow-sm hover:bg-white transition-colors"
      />

      {/* Image */}
      <Link href={`/products/${product.id}`} className="relative aspect-square bg-brand-light/20 overflow-hidden block">
        <Image
          src={getProductImageUrl(product.image_url) || '/placeholder-product.png'}
          alt={name}
          fill
          className="object-contain p-6 transition-transform duration-700 group-hover:scale-110"
        />
        {product.stock_quantity === 0 && !product.is_service && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="px-4 py-2 bg-brand-dark text-white text-xs font-black rounded-lg uppercase">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-1 mb-3">
          <Star size={12} className="fill-brand-orange text-brand-orange" />
          <span className="text-xs font-black text-brand-dark">{product.rating || 0}</span>
          <span className="text-[10px] text-brand-dark/40 font-medium">({product.reviews_count || 0})</span>
        </div>

        <Link href={`/products/${product.id}`} className="block mb-2 group-hover:text-brand-orange transition-colors">
          <h3 className="font-bold text-brand-dark line-clamp-2 leading-tight">{name}</h3>
        </Link>

        <p className="text-xl font-black text-brand-orange mt-auto mb-6">
          <span className="text-xs font-medium ltr:mr-1 rtl:ml-1">{t('egp')}</span>
          {product.price.toLocaleString()}
        </p>

        <button
          onClick={() => addToCart(product)}
          disabled={product.stock_quantity === 0 && !product.is_service}
          className="w-full py-3.5 bg-brand-dark text-brand-light rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-brand-orange hover:text-brand-dark transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
        >
          <ShoppingCart size={16} />
          {product.is_service ? "Book Service" : t('addToCart')}
        </button>
      </div>
    </div>
  );
}
