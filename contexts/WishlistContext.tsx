'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { WishlistWithProduct } from '@/types';
import { getWishlist, addToWishlist, removeFromWishlist } from '@/lib/actions/wishlist';
import { useAuth } from './AuthContext';
import { useRouter } from 'next/navigation';

interface WishlistContextType {
  wishlistIds: Set<string>;
  wishlistItems: WishlistWithProduct[];
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<void>;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const router = useRouter();

  const wishlistIds = new Set(wishlistItems.map(item => item.product_id));

  const fetchWishlist = async () => {
    if (user) {
      setLoading(true);
      const items = await getWishlist();
      setWishlistItems(items);
      setLoading(false);
    } else {
      setWishlistItems([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const isWishlisted = (productId: string) => wishlistIds.has(productId);

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      router.push('/login');
      return;
    }

    const currentlyWishlisted = isWishlisted(productId);

    if (currentlyWishlisted) {
      // Optimistic update
      setWishlistItems(prev => prev.filter(item => item.product_id !== productId));
      const result = await removeFromWishlist(productId);
      if (!result.success) {
        // Rollback on failure
        fetchWishlist();
      }
    } else {
      // Optimistic update - we don't have the full product info here easily, 
      // but we can at least update the ID set
      const result = await addToWishlist(productId);
      if (result.success) {
        fetchWishlist();
      }
    }
  };

  return (
    <WishlistContext.Provider value={{
      wishlistIds,
      wishlistItems,
      isWishlisted,
      toggleWishlist,
      loading
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
