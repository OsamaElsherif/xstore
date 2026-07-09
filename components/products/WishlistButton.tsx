'use client';

import { Heart } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useState } from 'react';

interface WishlistButtonProps {
  productId: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function WishlistButton({ productId, size = 'md', className = '' }: WishlistButtonProps) {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [isToggling, setIsToggling] = useState(false);
  
  const wishlisted = isWishlisted(productId);

  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 24 : 20;

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isToggling) return;
    
    setIsToggling(true);
    await toggleWishlist(productId);
    setIsToggling(false);
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isToggling}
      className={`transition-all duration-300 transform active:scale-75 ${
        wishlisted 
          ? 'text-brand-orange scale-110' 
          : 'text-brand-dark hover:text-brand-orange'
      } ${className}`}
      title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
    >
      <Heart 
        size={iconSize} 
        className={`${wishlisted ? 'fill-brand-orange' : ''} ${isToggling ? 'opacity-50' : ''}`} 
      />
    </button>
  );
}
