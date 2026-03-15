import React from 'react'

const statuses = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending', color: '#f59e0b' },
  { value: 'on_route', label: 'On Route', color: '#3b82f6' },
  { value: 'delayed', label: 'Delayed', color: '#ef4444' },
  { value: 'delivered', label: 'Delivered', color: '#22c55e' },
]

const chipStyle = (active, color) => ({
  padding: '8px 16px',
  borderRadius: '20px',
  border: 'none',
  cursor: 'pointer',
  fontWeight: active ? 700 : 500,
  fontSize: '14px',
  background: active ? (color || '#6b7280') : '#e5e7eb',
  color: active ? '#fff' : '#374151',
  transition: 'all 0.2s',
})

export default function StatusFilter({ current, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
      {statuses.map(s => (
        <button
          key={s.value}
          style={chipStyle(current === s.value, s.color)}
          onClick={() => onChange(s.value)}
        >
          {s.label}
        </button>
      ))}
    </div>
  )
}

export { statuses }
