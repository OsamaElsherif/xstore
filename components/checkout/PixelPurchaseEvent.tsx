'use client'
import { useEffect } from 'react'

export function PixelPurchaseEvent({
  value,
  currency = 'EGP',
}: {
  value: number
  currency?: string
}) {
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'Purchase', { value, currency })
    }
  }, [value, currency])
  return null
}
