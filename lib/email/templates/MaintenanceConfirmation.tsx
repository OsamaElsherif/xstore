import React from 'react'

type MaintenanceConfirmationProps = {
  customerName: string
  requestNumber: string
  deviceBrand: string
  deviceType: string
  issueDescription: string
  trackingUrl: string
}

export function MaintenanceConfirmation({
  customerName,
  requestNumber,
  deviceBrand,
  deviceType,
  issueDescription,
  trackingUrl,
}: MaintenanceConfirmationProps) {
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
            fontSize: '20px',
            fontWeight: 'bold',
            margin: '12px 0 0',
            letterSpacing: '2px',
          }}>
            JACOB STORE — REPAIR CENTER
          </h1>
        </div>

        {/* Body */}
        <div style={{ padding: '40px' }}>
          <p style={{ fontSize: '18px', color: '#1F222C', margin: '0 0 8px' }}>
            Hi {customerName},
          </p>
          <p style={{ fontSize: '16px', color: '#1F222C', margin: '0 0 24px' }}>
            We&apos;ve received your repair request. 🔧
          </p>

          <div style={{
            backgroundColor: '#f8f8f8',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
          }}>
            <p style={{ fontSize: '13px', color: '#888', margin: '0 0 4px', textTransform: 'uppercase' as const, letterSpacing: '1px' }}>
              Request Number
            </p>
            <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#1F222C', margin: '0' }}>
              {requestNumber}
            </p>
          </div>

          {/* Device Details */}
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
            Device Details
          </h2>

          <table style={{ width: '100%', borderCollapse: 'collapse' as const, marginBottom: '24px' }}>
            <tbody>
              <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px 0', fontSize: '14px', color: '#888', width: '100px' }}>Brand</td>
                <td style={{ padding: '10px 0', fontSize: '14px', color: '#1F222C', fontWeight: '600' }}>{deviceBrand}</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px 0', fontSize: '14px', color: '#888' }}>Model</td>
                <td style={{ padding: '10px 0', fontSize: '14px', color: '#1F222C', fontWeight: '600' }}>{deviceType}</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 0', fontSize: '14px', color: '#888', verticalAlign: 'top' }}>Issue</td>
                <td style={{ padding: '10px 0', fontSize: '14px', color: '#1F222C' }}>{issueDescription}</td>
              </tr>
            </tbody>
          </table>

          {/* What's Next */}
          <h2 style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#888',
            textTransform: 'uppercase' as const,
            letterSpacing: '1.5px',
            margin: '0 0 12px',
            borderBottom: '2px solid #f0f0f0',
            paddingBottom: '8px',
          }}>
            What&apos;s Next
          </h2>
          <p style={{ fontSize: '14px', color: '#1F222C', margin: '0 0 24px', lineHeight: '1.6' }}>
            Our team will review your request and contact you with an estimated cost.
          </p>

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
              Track Your Repair
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
