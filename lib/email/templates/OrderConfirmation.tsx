import React from 'react'

type OrderConfirmationProps = {
  customerName: string
  orderNumber: string
  items: { name: string; quantity: number; price: number }[]
  totalPrice: number
  shippingAddress: string
  city: string
  trackingUrl: string
}

export function OrderConfirmation({
  customerName,
  orderNumber,
  items,
  totalPrice,
  shippingAddress,
  city,
  trackingUrl,
}: OrderConfirmationProps) {
  return (
    <div style={{
      fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      backgroundColor: '#f5f5f5',
      padding: '40px 0',
    }}>
      <div style={{
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#1F222C',
          padding: '32px 40px',
          textAlign: 'center' as const,
        }}>
          <div style={{
            display: 'inline-block',
            backgroundColor: '#FFAE42',
            color: '#1F222C',
            fontWeight: 'bold',
            fontSize: '20px',
            width: '40px',
            height: '40px',
            lineHeight: '40px',
            borderRadius: '8px',
            textAlign: 'center' as const,
          }}>
            J
          </div>
          <h1 style={{
            color: '#ffffff',
            fontSize: '24px',
            fontWeight: 'bold',
            margin: '12px 0 0',
            letterSpacing: '2px',
          }}>
            JACOB STORE
          </h1>
        </div>

        {/* Body */}
        <div style={{ padding: '40px' }}>
          <p style={{ fontSize: '18px', color: '#1F222C', margin: '0 0 8px' }}>
            Hi {customerName},
          </p>
          <p style={{ fontSize: '16px', color: '#1F222C', margin: '0 0 24px' }}>
            Thank you for your order! 🎉
          </p>

          <div style={{
            backgroundColor: '#f8f8f8',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
          }}>
            <p style={{ fontSize: '13px', color: '#888', margin: '0 0 4px', textTransform: 'uppercase' as const, letterSpacing: '1px' }}>
              Order Number
            </p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#1F222C', margin: '0' }}>
              {orderNumber}
            </p>
          </div>

          {/* Order Summary */}
          <h2 style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#888',
            textTransform: 'uppercase' as const,
            letterSpacing: '1.5px',
            margin: '0 0 16px',
            borderBottom: '2px solid #f0f0f0',
            paddingBottom: '8px',
          }}>
            Order Summary
          </h2>

          <table style={{ width: '100%', borderCollapse: 'collapse' as const, marginBottom: '16px' }}>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px 0', fontSize: '14px', color: '#1F222C' }}>
                    {item.name} <span style={{ color: '#888' }}>× {item.quantity}</span>
                  </td>
                  <td style={{ padding: '12px 0', fontSize: '14px', color: '#1F222C', textAlign: 'right' as const, fontWeight: '600' }}>
                    EGP {(item.price * item.quantity).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 0',
            borderTop: '2px solid #1F222C',
          }}>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#1F222C' }}>Total</span>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFAE42' }}>
              EGP {totalPrice.toLocaleString()}
            </span>
          </div>

          {/* Delivery Info */}
          {(shippingAddress || city) && (
            <>
              <h2 style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: '#888',
                textTransform: 'uppercase' as const,
                letterSpacing: '1.5px',
                margin: '24px 0 12px',
                borderBottom: '2px solid #f0f0f0',
                paddingBottom: '8px',
              }}>
                Delivery
              </h2>
              <p style={{ fontSize: '14px', color: '#1F222C', margin: '0 0 24px' }}>
                {[shippingAddress, city].filter(Boolean).join(', ')}
              </p>
            </>
          )}

          {/* CTA Button */}
          <div style={{ textAlign: 'center' as const, margin: '32px 0 16px' }}>
            <a
              href={trackingUrl}
              style={{
                display: 'inline-block',
                backgroundColor: '#FFAE42',
                color: '#1F222C',
                fontWeight: 'bold',
                fontSize: '14px',
                padding: '14px 32px',
                borderRadius: '50px',
                textDecoration: 'none',
                letterSpacing: '0.5px',
              }}
            >
              Track Your Order
            </a>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          backgroundColor: '#f8f8f8',
          padding: '24px 40px',
          textAlign: 'center' as const,
          borderTop: '1px solid #f0f0f0',
        }}>
          <p style={{ fontSize: '13px', color: '#888', margin: '0' }}>
            Questions? Contact us at{' '}
            <a href="mailto:orders@jacobstore.com" style={{ color: '#FFAE42', textDecoration: 'none' }}>
              orders@jacobstore.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
