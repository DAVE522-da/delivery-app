import React, { useState, useEffect } from 'react'
import StatusFilter from './StatusFilter'
import DeliveryTable from './DeliveryTable'
import DeliveryMap from './DeliveryMap'
import { fetchDeliveries, fetchDrivers } from '../api'

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

export default function ManagerDashboard() {
  const [deliveries, setDeliveries] = useState([])
  const [drivers, setDrivers] = useState([])
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

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

  return (
    <div style={containerStyle}>
      <div style={leftPanel}>
        <h1 style={headerStyle}>Delivery Manager</h1>
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
