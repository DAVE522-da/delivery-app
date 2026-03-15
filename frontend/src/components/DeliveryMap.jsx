import React, { useEffect, useRef } from 'react'
import L from 'leaflet'

const statusColors = {
  pending: '#f59e0b',
  on_route: '#3b82f6',
  delayed: '#ef4444',
  delivered: '#22c55e',
}

function makeIcon(color, isDriver = false) {
  const svg = isDriver
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28"><circle cx="14" cy="14" r="12" fill="${color}" stroke="#fff" stroke-width="2"/><text x="14" y="19" text-anchor="middle" fill="#fff" font-size="14">🚚</text></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="36" viewBox="0 0 24 36"><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z" fill="${color}" stroke="#fff" stroke-width="1"/><circle cx="12" cy="12" r="5" fill="#fff"/></svg>`
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: isDriver ? [28, 28] : [24, 36],
    iconAnchor: isDriver ? [14, 14] : [12, 36],
    popupAnchor: [0, isDriver ? -14 : -36],
  })
}

export default function DeliveryMap({ deliveries, drivers, selectedDelivery }) {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markersRef = useRef([])

  // Initialize map
  useEffect(() => {
    if (mapInstance.current) return
    mapInstance.current = L.map(mapRef.current).setView([40.7580, -73.9855], 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapInstance.current)

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [])

  // Update markers
  useEffect(() => {
    const map = mapInstance.current
    if (!map) return

    // Clear old markers
    markersRef.current.forEach(m => map.removeLayer(m))
    markersRef.current = []

    const bounds = []

    // Delivery markers
    deliveries.forEach(d => {
      if (d.lat == null || d.lng == null) return
      const marker = L.marker([d.lat, d.lng], { icon: makeIcon(statusColors[d.status] || '#6b7280') })
        .bindPopup(`<b>${d.recipient_name || 'Delivery'}</b><br>${d.address}<br>Status: ${d.status}`)
        .addTo(map)
      markersRef.current.push(marker)
      bounds.push([d.lat, d.lng])
    })

    // Driver markers
    if (drivers) {
      drivers.forEach(dr => {
        if (dr.lat == null || dr.lng == null) return
        const marker = L.marker([dr.lat, dr.lng], { icon: makeIcon('#8b5cf6', true) })
          .bindPopup(`<b>🚚 ${dr.name}</b><br>Driver`)
          .addTo(map)
        markersRef.current.push(marker)
        bounds.push([dr.lat, dr.lng])
      })
    }

    // Fit bounds
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [30, 30] })
    }
  }, [deliveries, drivers])

  // Fly to selected delivery
  useEffect(() => {
    const map = mapInstance.current
    if (!map || !selectedDelivery || selectedDelivery.lat == null) return
    map.flyTo([selectedDelivery.lat, selectedDelivery.lng], 16, { duration: 0.8 })

    // Open popup for matched marker
    markersRef.current.forEach(m => {
      const latlng = m.getLatLng()
      if (Math.abs(latlng.lat - selectedDelivery.lat) < 0.0001 && Math.abs(latlng.lng - selectedDelivery.lng) < 0.0001) {
        m.openPopup()
      }
    })
  }, [selectedDelivery])

  return <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '400px', borderRadius: '8px' }} />
}
