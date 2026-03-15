const express = require('express');
const { getDb, save, allRows, getRow } = require('../db');
const { fetchBoardItems, createMondayItem, updateMondayStatus, parseMondayItem } = require('../monday');
const router = express.Router();

// POST /api/monday/sync — sync all deliveries TO Monday.com
router.post('/sync', async (req, res) => {
  try {
    const db = await getDb();
    const deliveries = allRows(db, 'SELECT * FROM deliveries');

    let created = 0;
    let updated = 0;

    for (const delivery of deliveries) {
      if (delivery.monday_item_id) {
        // Already linked — update status on Monday.com
        await updateMondayStatus(delivery.monday_item_id, delivery.status);
        updated++;
      } else {
        // Create new item on Monday.com
        const mondayId = await createMondayItem(delivery);
        db.run('UPDATE deliveries SET monday_item_id = ? WHERE id = ?', [String(mondayId), delivery.id]);
        created++;
      }
    }

    save();
    res.json({ success: true, created, updated, total: deliveries.length });
  } catch (err) {
    console.error('Monday sync error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/monday/pull — pull items FROM Monday.com into local DB
router.post('/pull', async (req, res) => {
  try {
    const db = await getDb();
    const items = await fetchBoardItems();

    let created = 0;
    let updated = 0;

    for (const item of items) {
      const parsed = parseMondayItem(item);

      // Check if we already have this Monday item linked
      const existing = getRow(db, 'SELECT * FROM deliveries WHERE monday_item_id = ?', [parsed.monday_item_id]);

      if (existing) {
        // Update status from Monday.com
        db.run('UPDATE deliveries SET status = ?, address = ?, expected_delivery_time = ? WHERE monday_item_id = ?', [
          parsed.status,
          parsed.address,
          parsed.expected_delivery_time,
          parsed.monday_item_id,
        ]);
        updated++;
      } else {
        // Create new local delivery from Monday.com item
        db.run(
          'INSERT INTO deliveries (address, lat, lng, expected_delivery_time, status, recipient_name, monday_item_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [parsed.address, parsed.lat, parsed.lng, parsed.expected_delivery_time, parsed.status, parsed.name, parsed.monday_item_id]
        );
        created++;
      }
    }

    save();
    res.json({ success: true, created, updated, total: items.length });
  } catch (err) {
    console.error('Monday pull error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/monday/status — check connection status
router.get('/status', async (_req, res) => {
  try {
    const items = await fetchBoardItems();
    res.json({ connected: true, boardItems: items.length });
  } catch (err) {
    res.json({ connected: false, error: err.message });
  }
});

module.exports = router;
