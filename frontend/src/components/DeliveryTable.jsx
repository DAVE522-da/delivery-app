import React from 'react'

const statusColors = {
  pending: '#f59e0b',
  on_route: '#3b82f6',
  delayed: '#ef4444',
  delivered: '#22c55e',
}

const statusLabels = {
  pending: 'Pending',
  on_route: 'On Route',
  delayed: 'Delayed',
  delivered: 'Delivered',
}

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '14px',
}

const thStyle = {
  textAlign: 'left',
  padding: '10px 12px',
  borderBottom: '2px solid #e5e7eb',
  color: '#6b7280',
  fontWeight: 600,
  fontSize: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const tdStyle = {
  padding: '10px 12px',
  borderBottom: '1px solid #f3f4f6',
}

const badgeStyle = (status) => ({
  display: 'inline-block',
  padding: '3px 10px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: 600,
  color: '#fff',
  background: statusColors[status] || '#6b7280',
})

export default function DeliveryTable({ deliveries, onSelect, selectedId }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Driver</th>
            <th style={thStyle}>Address</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Expected</th>
          </tr>
        </thead>
        <tbody>
          {deliveries.map(d => (
            <tr
              key={d.id}
              onClick={() => onSelect(d)}
              style={{
                cursor: 'pointer',
                background: selectedId === d.id ? '#eff6ff' : 'transparent',
              }}
              onMouseEnter={e => { if (selectedId !== d.id) e.currentTarget.style.background = '#f9fafb' }}
              onMouseLeave={e => { if (selectedId !== d.id) e.currentTarget.style.background = 'transparent' }}
            >
              <td style={tdStyle}>{d.id}</td>
              <td style={tdStyle}>{d.driver_name || '—'}</td>
              <td style={{ ...tdStyle, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.address}</td>
              <td style={tdStyle}><span style={badgeStyle(d.status)}>{statusLabels[d.status]}</span></td>
              <td style={tdStyle}>{d.expected_delivery_time ? new Date(d.expected_delivery_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
            </tr>
          ))}
          {deliveries.length === 0 && (
            <tr><td colSpan={5} style={{ ...tdStyle, textAlign: 'center', color: '#9ca3af' }}>No deliveries found</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
