import React, { useState, useEffect } from 'react'
import StatusFilter from './StatusFilter'
import DeliveryTable from './DeliveryTable'
import DeliveryMap from './DeliveryMap'
import { fetchDeliveries, fetchDrivers, mondaySync, mondayPull } from '../api'

const containerStyle = {
  display: 'flex',
  height: '100vh',
  gap: '0',
}

const leftPanel = {
  flex: '1 1 50%',
  display: 'flex',
  flexDirection: 'column',
  padding: '20px',
  overflowY: 'auto',
  background: '#fff',
  borderRight: '1px solid #e5e7eb',
}

const rightPanel = {
  flex: '1 1 50%',
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
}

const headerStyle = {
  fontSize: '24px',
  fontWeight: 700,
  marginBottom: '16px',
  color: '#111827',
}

const syncBarStyle = {
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
  marginBottom: '16px',
  padding: '12px',
  background: '#f8fafc',
  borderRadius: '8px',
  border: '1px solid #e2e8f0',
}

const syncBtnStyle = (color) => ({
  padding: '8px 16px',
  borderRadius: '8px',
  border: 'none',
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: '13px',
  background: color,
  color: '#fff',
})

const syncLabelStyle = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#475569',
  marginRight: 'auto',
}

export default function ManagerDashboard() {
  const [deliveries, setDeliveries] = useState([])
  const [drivers, setDrivers] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncMsg, setSyncMsg] = useState('')

  useEffect(() => {
    loadData()
  }, [statusFilter])

  async function loadData() {
    setLoading(true)
    const [dels, drvs] = await Promise.all([
      fetchDeliveries(statusFilter || undefined),
      fetchDrivers(),
    ])
    setDeliveries(dels)
    setDrivers(drvs)
    setLoading(false)
  }

  async function handlePushToMonday() {
    setSyncMsg('Pushing to Monday.com...')
    try {
      const result = await mondaySync()
      setSyncMsg(`Pushed: ${result.created} created, ${result.updated} updated`)
    } catch {
      setSyncMsg('Push failed')
    }
    setTimeout(() => setSyncMsg(''), 4000)
  }

  async function handlePullFromMonday() {
    setSyncMsg('Pulling from Monday.com...')
    try {
      const result = await mondayPull()
      setSyncMsg(`Pulled: ${result.created} new, ${result.updated} updated`)
      await loadData()
    } catch {
      setSyncMsg('Pull failed')
    }
    setTimeout(() => setSyncMsg(''), 4000)
  }

  return (
    <div style={containerStyle}>
      <div style={leftPanel}>
        <h1 style={headerStyle}>Delivery Manager</h1>

        <div style={syncBarStyle}>
          <span style={syncLabelStyle}>Monday.com</span>
          {syncMsg && <span style={{ fontSize: '12px', color: '#64748b' }}>{syncMsg}</span>}
          <button style={syncBtnStyle('#0073ea')} onClick={handlePushToMonday}>Push to Monday</button>
          <button style={syncBtnStyle('#6b7280')} onClick={handlePullFromMonday}>Pull from Monday</button>
        </div>

        <StatusFilter current={statusFilter} onChange={setStatusFilter} />
        {loading ? (
          <p style={{ color: '#9ca3af' }}>Loading...</p>
        ) : (
          <DeliveryTable
            deliveries={deliveries}
            onSelect={setSelected}
            selectedId={selected?.id}
          />
        )}
      </div>
      <div style={rightPanel}>
        <DeliveryMap
          deliveries={deliveries}
          drivers={drivers}
          selectedDelivery={selected}
        />
      </div>
    </div>
  )
}
