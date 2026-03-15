import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ManagerDashboard from './components/ManagerDashboard'
import DriverView from './components/DriverView'

const appStyle = {
  margin: 0,
  padding: 0,
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  minHeight: '100vh',
  background: '#f0f2f5',
}

export default function App() {
  return (
    <div style={appStyle}>
      <BrowserRouter>
        <Routes>
          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="/driver/:driverId" element={<DriverView />} />
          <Route path="*" element={<Navigate to="/manager" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}
