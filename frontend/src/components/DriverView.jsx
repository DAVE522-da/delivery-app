import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { fetchNextDelivery, fetchDriver, updateDeliveryStatus } from '../api'

const containerStyle = {
  maxWidth: '480px',
  margin: '0 auto',
  padding: '20px',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
}

const headerStyle = {
  fontSize: '20px',
  fontWeight: 700,
  color: '#111827',
  marginBottom: '8px',
}

const subHeaderStyle = {
  fontSize: '14px',
  color: '#6b7280',
  marginBottom: '24px',
}

const cardStyle = {
  background: '#fff',
  borderRadius: '16px',
  padding: '24px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.1), 0 4px 12px rgba(0,0,0,0.05)',
  marginBottom: '20px',
}

const labelStyle = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: '4px',
}

const valueStyle = {
  fontSize: '18px',
  fontWeight: 600,
  color: '#111827',
  marginBottom: '16px',
}

const btnBase = {
  display: 'block',
  width: '100%',
  padding: '16px',
  borderRadius: '12px',
  border: 'none',
  fontSize: '18px',
  fontWeight: 700,
  cursor: 'pointer',
  marginBottom: '12px',
  textAlign: 'center',
  textDecoration: 'none',
  color: '#fff',
}

const emptyStyle = {
  textAlign: 'center',
  padding: '60px 20px',
  color: '#22c55e',
  fontSize: '20px',
  fontWeight: 700,
}

export default function DriverView() {
  const { driverId } = useParams()
  const [delivery, setDelivery] = useState(null)
  const [driver, setDriver] = useState(null)
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)

  useEffect(() => {
    loadData()
  }, [driverId])

  async function loadData() {
    setLoading(true)
    const [del, drv] = await Promise.all([
      fetchNextDelivery(driverId),
      fetchDriver(driverId),
    ])
    setDelivery(del)
    setDriver(drv)
    setLoading(false)
  }

  async function handleMarkDelivered() {
    if (!delivery || marking) return
    setMarking(true)
    await updateDeliveryStatus(delivery.id, 'delivered')
    await loadData()
    setMarking(false)
  }

  if (loading) {
    return <div style={containerStyle}><p style={{ color: '#9ca3af', textAlign: 'center', marginTop: '40px' }}>Loading...</p></div>
  }

  const navUrl = delivery
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(delivery.address)}`
    : '#'

  return (
    <div style={containerStyle}>
      <h1 style={headerStyle}>
        {driver ? `Hi, ${driver.name}` : `Driver #${driverId}`}
      </h1>
      <p style={subHeaderStyle}>Your next delivery</p>

      {!delivery ? (
        <div style={{ ...cardStyle, ...emptyStyle }}>
          ✓ All deliveries complete!
        </div>
      ) : (
        <>
          <div style={cardStyle}>
            <div style={labelStyle}>Recipient</div>
            <div style={valueStyle}>{delivery.recipient_name || '—'}</div>

            <div style={labelStyle}>Address</div>
            <div style={{ ...valueStyle, fontSize: '16px' }}>{delivery.address}</div>

            <div style={labelStyle}>Expected Time</div>
            <div style={valueStyle}>
              {delivery.expected_delivery_time
                ? new Date(delivery.expected_delivery_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '—'}
            </div>
          </div>

          <a
            href={navUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ ...btnBase, background: '#3b82f6' }}
          >
            📍 Navigate
          </a>

          <a
            href={delivery.recipient_phone ? `tel:${delivery.recipient_phone}` : '#'}
            style={{ ...btnBase, background: '#8b5cf6' }}
          >
            📞 Call {delivery.recipient_name || 'Recipient'}
          </a>

          <button
            onClick={handleMarkDelivered}
            disabled={marking}
            style={{
              ...btnBase,
              background: marking ? '#86efac' : '#22c55e',
              cursor: marking ? 'not-allowed' : 'pointer',
            }}
          >
            {marking ? 'Updating...' : '✓ Mark Delivered'}
          </button>
        </>
      )}
    </div>
  )
}
