'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Offer } from '@/types';

interface PriceDisplayProps {
  originalPrice: number;
  discountedPrice: number | null;
  activeOffer?: Offer | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function PriceDisplay({
  originalPrice,
  discountedPrice,
  activeOffer,
  size = 'md',
  className = '',
}: PriceDisplayProps) {
  const { t } = useLanguage();

  const isDiscounted = discountedPrice !== null && discountedPrice < originalPrice;

  const sizeClasses = {
    sm: {
      container: 'text-xs gap-1.5',
      original: 'text-gray-400 line-through',
      discounted: 'font-bold text-green-600',
      badge: 'text-[9px] px-1.5 py-0.5 rounded font-bold bg-red-500 text-white',
    },
    md: {
      container: 'text-sm gap-2',
      original: 'text-gray-400 line-through',
      discounted: 'font-bold text-green-600 text-base',
      badge: 'text-[10px] px-2 py-0.5 rounded-md font-bold bg-red-500 text-white',
    },
    lg: {
      container: 'text-base gap-3',
      original: 'text-gray-400 line-through text-lg',
      discounted: 'font-extrabold text-green-600 text-2xl',
      badge: 'text-xs px-2.5 py-1 rounded-lg font-bold bg-red-500 text-white',
    },
  };

  const currentSize = sizeClasses[size];

  if (!isDiscounted) {
    return (
      <span className={`font-bold text-brand-dark ${size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-base' : 'text-sm'} ${className}`}>
        {t('egp')} {originalPrice.toLocaleString()}
      </span>
    );
  }

  // Calculate percentage if possible
  let discountPercentage = 0;
  if (activeOffer && activeOffer.discount_type === 'PERCENTAGE') {
    discountPercentage = activeOffer.discount_value;
  } else if (originalPrice > 0 && discountedPrice !== null) {
    discountPercentage = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
  }

  return (
    <div className={`flex items-center flex-wrap ${currentSize.container} ${className}`}>
      <span className={currentSize.discounted}>
        {t('egp')} {discountedPrice?.toLocaleString()}
      </span>
      <span className={currentSize.original}>
        {t('egp')} {originalPrice.toLocaleString()}
      </span>
      {discountPercentage > 0 && (
        <span className={currentSize.badge}>
          {discountPercentage}% {t('off') || 'OFF'}
        </span>
      )}
    </div>
  );
}
