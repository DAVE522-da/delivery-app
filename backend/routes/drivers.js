const express = require('express');
const { getDb, save, allRows, getRow } = require('../db');
const router = express.Router();

// GET /api/drivers
router.get('/', async (_req, res) => {
  const db = await getDb();
  const rows = allRows(db, 'SELECT * FROM drivers');
  res.json(rows);
});

// GET /api/drivers/:id
router.get('/:id', async (req, res) => {
  const db = await getDb();
  const row = getRow(db, 'SELECT * FROM drivers WHERE id = ?', [Number(req.params.id)]);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// GET /api/drivers/:id/next-delivery
router.get('/:id/next-delivery', async (req, res) => {
  const db = await getDb();
  const row = getRow(db, `
    SELECT d.*, dr.name AS driver_name
    FROM deliveries d
    LEFT JOIN drivers dr ON d.driver_id = dr.id
    WHERE d.driver_id = ? AND d.status IN ('pending', 'on_route')
    ORDER BY d.expected_delivery_time ASC
    LIMIT 1
  `, [Number(req.params.id)]);
  res.json(row || null);
});

// PATCH /api/drivers/:id/location
router.patch('/:id/location', async (req, res) => {
  const db = await getDb();
  const { lat, lng } = req.body;
  if (lat == null || lng == null) return res.status(400).json({ error: 'lat and lng are required' });
  db.run('UPDATE drivers SET lat = ?, lng = ? WHERE id = ?', [lat, lng, Number(req.params.id)]);
  const changes = db.getRowsModified();
  if (changes === 0) return res.status(404).json({ error: 'Not found' });
  save();
  res.json({ success: true });
});

module.exports = router;
