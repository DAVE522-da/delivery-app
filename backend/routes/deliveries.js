const express = require('express');
const { getDb, save, allRows, getRow } = require('../db');
const router = express.Router();

// GET /api/deliveries — list all, optional ?status= filter
router.get('/', async (req, res) => {
  const db = await getDb();
  const { status } = req.query;
  let rows;
  if (status) {
    rows = allRows(db, `
      SELECT d.*, dr.name AS driver_name
      FROM deliveries d
      LEFT JOIN drivers dr ON d.driver_id = dr.id
      WHERE d.status = ?
      ORDER BY d.expected_delivery_time
    `, [status]);
  } else {
    rows = allRows(db, `
      SELECT d.*, dr.name AS driver_name
      FROM deliveries d
      LEFT JOIN drivers dr ON d.driver_id = dr.id
      ORDER BY d.expected_delivery_time
    `);
  }
  res.json(rows);
});

// GET /api/deliveries/:id
router.get('/:id', async (req, res) => {
  const db = await getDb();
  const row = getRow(db, `
    SELECT d.*, dr.name AS driver_name
    FROM deliveries d
    LEFT JOIN drivers dr ON d.driver_id = dr.id
    WHERE d.id = ?
  `, [Number(req.params.id)]);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

// POST /api/deliveries
router.post('/', async (req, res) => {
  const db = await getDb();
  const { address, lat, lng, expected_delivery_time, driver_id, status, recipient_phone, recipient_name } = req.body;
  if (!address) return res.status(400).json({ error: 'address is required' });
  db.run(
    'INSERT INTO deliveries (address, lat, lng, expected_delivery_time, driver_id, status, recipient_phone, recipient_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [address, lat ?? null, lng ?? null, expected_delivery_time ?? null, driver_id ?? null, status ?? 'pending', recipient_phone ?? null, recipient_name ?? null]
  );
  const id = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];
  save();
  res.status(201).json({ id });
});

// PATCH /api/deliveries/:id/status
router.patch('/:id/status', async (req, res) => {
  const db = await getDb();
  const { status } = req.body;
  const valid = ['pending', 'on_route', 'delayed', 'delivered'];
  if (!valid.includes(status)) return res.status(400).json({ error: `status must be one of: ${valid.join(', ')}` });
  db.run('UPDATE deliveries SET status = ? WHERE id = ?', [status, Number(req.params.id)]);
  const changes = db.getRowsModified();
  if (changes === 0) return res.status(404).json({ error: 'Not found' });
  save();
  res.json({ success: true });
});

module.exports = router;
