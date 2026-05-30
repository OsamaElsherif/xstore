'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, ShoppingCart, User, Menu, Globe, Package, X, Home, ShoppingBag, Info, Phone, HelpCircle, Wrench, Heart, Loader2, ChevronDown, Grid3X3 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { searchProducts } from '@/lib/actions/products';
import { getCategoriesWithSubcategories } from '@/lib/actions/subcategories';
import { Product, CategoryWithSubcategories } from '@/types';
import { getProductImageUrl } from '@/lib/supabase/storage';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { cartCount, setIsCartOpen } = useCart();
  const { user, signOut, isAdmin, isCashier, isOrderReceiver } = useAuth();
  const { wishlistItems } = useWishlist();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryWithSubcategories[]>([]);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const router = useRouter();

  // Fetch categories for the menu
  useEffect(() => {
    getCategoriesWithSubcategories().then(setCategories);
  }, []);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const isStaff = isAdmin || isCashier || isOrderReceiver;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const results = await searchProducts(query, { limit: 5 });
      setSuggestions(results);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (searchQuery) {
      setShowSuggestions(true);
      debounceTimer.current = setTimeout(() => {
        handleSearch(searchQuery);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [searchQuery, handleSearch]);

  const onSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
      setSearchQuery('');
    }
  };

  const handleSuggestionClick = (productId: string) => {
    router.push(`/products/${productId}`);
    setShowSuggestions(false);
    setSearchQuery('');
  };

  return (
    <>
      <nav className="bg-brand-dark text-brand-light py-4 px-6 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-orange rounded-md flex items-center justify-center font-display font-bold text-brand-dark">
              J
            </div>
            <span className="font-display font-bold text-xl tracking-tight hidden sm:block">
              JACOB STORE
            </span>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8 relative" ref={searchRef}>
            <form onSubmit={onSearchSubmit} className="w-full relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowSuggestions(true)}
                placeholder={t('searchPlaceholder')}
                className="w-full bg-brand-light/10 border border-brand-gray/20 rounded-full py-2 px-4 ltr:pl-4 ltr:pr-10 rtl:pr-4 rtl:pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange text-brand-light placeholder:text-brand-gray/60"
              />
              <div className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {isSearching && <Loader2 size={16} className="animate-spin text-brand-orange" />}
                <button type="submit" className="text-brand-gray hover:text-brand-orange transition-colors">
                  <Search size={18} />
                </button>
              </div>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && (searchQuery.trim().length >= 2) && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-brand-dark border border-brand-gray/20 rounded-2xl shadow-2xl overflow-hidden z-50">
                {isSearching && suggestions.length === 0 ? (
                  <div className="p-4 text-center text-brand-gray text-sm">
                    {t('searching')}...
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="py-2">
                    {suggestions.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleSuggestionClick(product.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-brand-light/10 transition-colors text-left"
                      >
                        <div className="relative w-10 h-10 rounded-lg bg-white overflow-hidden shrink-0">
                          <Image
                            src={getProductImageUrl(product.image_url) || '/placeholder-product.png'}
                            alt={language === 'ar' ? product.name_ar : product.name_en}
                            fill
                            className="object-contain p-1"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-brand-light truncate">
                            {language === 'ar' ? product.name_ar : product.name_en}
                          </p>
                          <p className="text-xs text-brand-orange font-bold">
                            {t('egp')} {product.price.toLocaleString()}
                          </p>
                        </div>
                      </button>
                    ))}
                    <button
                      onClick={() => onSearchSubmit()}
                      className="w-full p-3 text-center text-xs font-bold text-brand-gray hover:text-brand-orange border-t border-brand-gray/10 transition-colors"
                    >
                      {t('seeAllResults')} "{searchQuery}"
                    </button>
                  </div>
                ) : !isSearching && (
                  <div className="p-4 text-center text-brand-gray text-sm">
                    {t('noResultsFound')}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Categories Dropdown */}
            <div className="hidden lg:block relative group">
              <button 
                onMouseEnter={() => setIsCategoriesOpen(true)}
                className="text-brand-gray hover:text-brand-orange transition-colors text-sm font-bold uppercase tracking-widest flex items-center gap-1 py-4"
              >
                Categories
                <ChevronDown size={14} className={`transition-transform duration-300 ${isCategoriesOpen ? 'rotate-180' : ''}`} />
              </button>

              {isCategoriesOpen && (
                <div 
                  onMouseLeave={() => setIsCategoriesOpen(false)}
                  className="absolute top-full ltr:left-0 rtl:right-0 w-[600px] bg-brand-dark border border-brand-gray/20 rounded-2xl shadow-2xl p-6 grid grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-200"
                >
                  {categories.map(cat => (
                    <div key={cat.id} className="space-y-3">
                      <Link 
                        href={`/categories/${cat.slug}`}
                        className="text-brand-orange font-bold text-sm hover:underline block"
                        onClick={() => setIsCategoriesOpen(false)}
                      >
                        {language === 'ar' ? cat.name_ar : cat.name_en}
                      </Link>
                      <div className="space-y-1.5">
                        {cat.subcategories?.slice(0, 5).map(sub => (
                          <Link
                            key={sub.id}
                            href={`/categories/${cat.slug}/${sub.slug}`}
                            className="block text-xs text-brand-gray hover:text-brand-light transition-colors"
                            onClick={() => setIsCategoriesOpen(false)}
                          >
                            {language === 'ar' ? sub.name_ar : sub.name_en}
                          </Link>
                        ))}
                        {cat.subcategories?.length > 5 && (
                          <Link 
                            href={`/categories/${cat.slug}`}
                            className="text-[10px] text-brand-orange/60 font-bold hover:text-brand-orange transition-colors block pt-1"
                            onClick={() => setIsCategoriesOpen(false)}
                          >
                            + {cat.subcategories.length - 5} more
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link href="/shop" className="hidden md:block text-brand-gray hover:text-brand-orange transition-colors text-sm font-bold uppercase tracking-widest">
              {t('shop')}
            </Link>
            <button 
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-1 text-brand-gray hover:text-brand-orange transition-colors text-sm font-medium"
            >
              <Globe size={18} />
              {language === 'en' ? 'عربي' : 'EN'}
            </button>
            <button className="md:hidden text-brand-gray hover:text-brand-orange transition-colors">
              <Search size={24} />
            </button>
            
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/wishlist" className="relative text-brand-gray hover:text-brand-orange transition-colors">
                  <Heart size={24} />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-brand-orange text-brand-dark text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-brand-dark">
                      {wishlistItems.length}
                    </span>
                  )}
                </Link>
                <Link href="/maintenance" className="hidden sm:flex items-center gap-3 p-3 rounded-xl text-brand-gray hover:text-white hover:bg-brand-light/10 transition-all">
                  <Wrench size={20} />
                  Maintenance
                </Link>
                <Link href="/track" className="hidden sm:flex items-center gap-3 p-3 rounded-xl text-brand-gray hover:text-white hover:bg-brand-light/10 transition-all">
                  <Package size={20} />
                  Track Order
                </Link>
                {isStaff && (
                  <Link href="/admin" className="hidden sm:block text-brand-gray hover:text-brand-orange transition-colors text-sm font-bold uppercase tracking-widest">
                    Admin
                  </Link>
                )}
                <button 
                  onClick={() => signOut()}
                  className="hidden sm:block text-brand-gray hover:text-brand-orange transition-colors"
                  title={t('signOut')}
                >
                  <X size={24} />
                </button>
              </div>
            ) : (
              <Link href="/login" className="hidden sm:block text-brand-gray hover:text-brand-orange transition-colors">
                <User size={24} />
              </Link>
            )}
            
            <button 
              onClick={() => setIsCartOpen(true)}
              className="text-brand-gray hover:text-brand-orange transition-colors relative"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1 ltr:-right-1 rtl:-left-1 bg-brand-orange text-brand-dark text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button 
              onClick={toggleMobileMenu}
              className="text-brand-gray hover:text-brand-orange transition-colors"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* Sidebar Navigation Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={toggleMobileMenu}
        />
      )}

      {/* Sidebar Navigation */}
      <div 
        className={`fixed top-0 ${language === 'ar' ? 'right-0 translate-x-full' : 'left-0 -translate-x-full'} w-72 h-full bg-brand-dark text-brand-light z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isMobileMenuOpen ? '!translate-x-0' : ''
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-brand-gray/20">
          <Link href="/" className="flex items-center gap-2" onClick={toggleMobileMenu}>
            <div className="w-8 h-8 bg-brand-orange rounded-md flex items-center justify-center font-display font-bold text-brand-dark">
              J
            </div>
            <span className="font-display font-bold text-xl tracking-tight">
              JACOB STORE
            </span>
          </Link>
          <button 
            onClick={toggleMobileMenu}
            className="text-brand-gray hover:text-brand-orange transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <ul className="space-y-2">
            <li>
              <Link href="/" className="flex items-center gap-3 p-3 rounded-xl text-brand-gray hover:text-white hover:bg-brand-light/10 transition-all" onClick={toggleMobileMenu}>
                <Home size={20} />
                {t('home')}
              </Link>
            </li>
            <li>
              <Link href="/shop" className="flex items-center gap-3 p-3 rounded-xl text-brand-gray hover:text-white hover:bg-brand-light/10 transition-all" onClick={toggleMobileMenu}>
                <ShoppingBag size={20} />
                {t('shop')}
              </Link>
            </li>
            
            {/* Mobile Categories */}
            {categories.map(cat => (
              <li key={cat.id} className="space-y-1">
                <div className="flex items-center justify-between p-3 text-brand-gray font-bold text-sm">
                  <Link href={`/categories/${cat.slug}`} className="flex items-center gap-3 hover:text-white transition-colors" onClick={toggleMobileMenu}>
                    <Grid3X3 size={18} />
                    {language === 'ar' ? cat.name_ar : cat.name_en}
                  </Link>
                </div>
                {cat.subcategories && cat.subcategories.length > 0 && (
                  <ul className="ltr:ml-10 rtl:mr-10 space-y-1 border-l border-brand-gray/10">
                    {cat.subcategories.map(sub => (
                      <li key={sub.id}>
                        <Link 
                          href={`/categories/${cat.slug}/${sub.slug}`}
                          className="block p-2 text-xs text-brand-gray/60 hover:text-brand-orange transition-colors"
                          onClick={toggleMobileMenu}
                        >
                          {language === 'ar' ? sub.name_ar : sub.name_en}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
            <li>
              <Link href="/maintenance" className="flex items-center gap-3 p-3 rounded-xl text-brand-gray hover:text-white hover:bg-brand-light/10 transition-all" onClick={toggleMobileMenu}>
                <Wrench size={20} />
                {t('maintenance')}
              </Link>
            </li>
            <li>
              <Link href="/about" className="flex items-center gap-3 p-3 rounded-xl text-brand-gray hover:text-white hover:bg-brand-light/10 transition-all" onClick={toggleMobileMenu}>
                <Info size={20} />
                {t('aboutUs')}
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-center gap-3 p-3 rounded-xl text-brand-gray hover:text-white hover:bg-brand-light/10 transition-all" onClick={toggleMobileMenu}>
                <Phone size={20} />
                {t('contact')}
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-center gap-3 p-3 rounded-xl text-brand-gray hover:text-white hover:bg-brand-light/10 transition-all" onClick={toggleMobileMenu}>
                <HelpCircle size={20} />
                {t('faq')}
              </Link>
            </li>
          </ul>
        </div>

        <div className="p-6 border-t border-brand-gray/20">
          {user ? (
            <div className="space-y-2">
              <Link href="/wishlist" className="flex items-center gap-3 w-full p-3 rounded-xl text-brand-gray hover:text-white hover:bg-brand-light/10 transition-all" onClick={toggleMobileMenu}>
                <Heart size={20} />
                Wishlist ({wishlistItems.length})
              </Link>
              {isStaff && (
                <Link href="/admin" className="flex items-center gap-3 w-full p-3 rounded-xl text-brand-orange hover:bg-brand-light/10 transition-all font-bold" onClick={toggleMobileMenu}>
                  <Wrench size={20} />
                  Admin Dashboard
                </Link>
              )}
              <button 
                onClick={() => { signOut(); toggleMobileMenu(); }}
                className="flex items-center gap-3 w-full p-3 rounded-xl text-brand-gray hover:text-white hover:bg-brand-light/10 transition-all"
              >
                <X size={20} />
                {t('signOut')}
              </button>
            </div>
          ) : (
            <Link href="/login" className="flex items-center gap-3 w-full p-3 rounded-xl text-brand-gray hover:text-white hover:bg-brand-light/10 transition-all" onClick={toggleMobileMenu}>
              <User size={20} />
              {t('signIn')}
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
