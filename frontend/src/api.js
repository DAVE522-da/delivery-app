const BASE = '/api';

export async function fetchDeliveries(status) {
  const url = status ? `${BASE}/deliveries?status=${status}` : `${BASE}/deliveries`;
  const res = await fetch(url);
  return res.json();
}

export async function fetchDelivery(id) {
  const res = await fetch(`${BASE}/deliveries/${id}`);
  return res.json();
}

export async function createDelivery(data) {
  const res = await fetch(`${BASE}/deliveries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function updateDeliveryStatus(id, status) {
  const res = await fetch(`${BASE}/deliveries/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  return res.json();
}

export async function fetchDrivers() {
  const res = await fetch(`${BASE}/drivers`);
  return res.json();
}

export async function fetchDriver(id) {
  const res = await fetch(`${BASE}/drivers/${id}`);
  return res.json();
}

export async function fetchNextDelivery(driverId) {
  const res = await fetch(`${BASE}/drivers/${driverId}/next-delivery`);
  return res.json();
}

export async function updateDriverLocation(id, lat, lng) {
  const res = await fetch(`${BASE}/drivers/${id}/location`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lat, lng }),
  });
  return res.json();
}
