import React from 'react'
import { MaintenanceStatus } from '@/types'

type MaintenanceStatusUpdateProps = {
  customerName: string
  requestNumber: string
  newStatus: MaintenanceStatus
  customerNotes: string | null
  estimatedCost: number | null
  actualCost: number | null
  trackingUrl: string
}

function getStatusMessage(status: MaintenanceStatus): string {
  switch (status) {
    case 'IN_PROGRESS':
      return "Good news! We've started working on your device."
    case 'WAITING_PARTS':
      return "We're waiting for spare parts to arrive. We'll update you soon."
    case 'DONE':
      return 'Your device is ready for pickup!'
    case 'CANCELLED':
      return 'Unfortunately your request was cancelled. Please contact us for details.'
    default:
      return 'Your repair status has been updated.'
  }
}

function getStatusLabel(status: MaintenanceStatus): string {
  switch (status) {
    case 'IN_PROGRESS': return 'In Progress'
    case 'WAITING_PARTS': return 'Waiting for Parts'
    case 'DONE': return 'Completed'
    case 'CANCELLED': return 'Cancelled'
    case 'PENDING': return 'Pending'
    case 'REVIEWED': return 'Reviewed'
    default: return status
  }
}

function getStatusColor(status: MaintenanceStatus): string {
  switch (status) {
    case 'IN_PROGRESS': return '#3b82f6'
    case 'WAITING_PARTS': return '#f59e0b'
    case 'DONE': return '#22c55e'
    case 'CANCELLED': return '#ef4444'
    default: return '#888888'
  }
}

export function MaintenanceStatusUpdate({
  customerName,
  requestNumber,
  newStatus,
  customerNotes,
  estimatedCost,
  actualCost,
  trackingUrl,
}: MaintenanceStatusUpdateProps) {
  const statusMessage = getStatusMessage(newStatus)
  const statusLabel = getStatusLabel(newStatus)
  const statusColor = getStatusColor(newStatus)

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
          <p style={{ fontSize: '16px', color: '#1F222C', margin: '0 0 24px', lineHeight: '1.6' }}>
            {statusMessage}
          </p>

          {/* Status Badge + Request Number */}
          <div style={{
            backgroundColor: '#f8f8f8',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: '13px', color: '#888', margin: '0 0 4px', textTransform: 'uppercase' as const, letterSpacing: '1px' }}>
                  Request Number
                </p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#1F222C', margin: '0' }}>
                  {requestNumber}
                </p>
              </div>
              <div style={{
                backgroundColor: statusColor,
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 'bold',
                padding: '6px 16px',
                borderRadius: '50px',
                textTransform: 'uppercase' as const,
                letterSpacing: '0.5px',
              }}>
                {statusLabel}
              </div>
            </div>
          </div>

          {/* Cost Info */}
          {(actualCost !== null || estimatedCost !== null) && (
            <div style={{
              backgroundColor: '#f8f8f8',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '24px',
            }}>
              {actualCost !== null && (
                <div style={{ marginBottom: estimatedCost !== null ? '12px' : '0' }}>
                  <p style={{ fontSize: '13px', color: '#888', margin: '0 0 4px', textTransform: 'uppercase' as const, letterSpacing: '1px' }}>
                    Final Cost
                  </p>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#FFAE42', margin: '0' }}>
                    EGP {actualCost.toLocaleString()}
                  </p>
                </div>
              )}
              {estimatedCost !== null && actualCost === null && (
                <div>
                  <p style={{ fontSize: '13px', color: '#888', margin: '0 0 4px', textTransform: 'uppercase' as const, letterSpacing: '1px' }}>
                    Estimated Cost
                  </p>
                  <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#1F222C', margin: '0' }}>
                    EGP {estimatedCost.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Customer Notes */}
          {customerNotes && (
            <>
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
                Notes
              </h2>
              <p style={{ fontSize: '14px', color: '#1F222C', margin: '0 0 24px', lineHeight: '1.6' }}>
                {customerNotes}
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
