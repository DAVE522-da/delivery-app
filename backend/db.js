const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'delivery.db');

let db;
let ready;

async function getDb() {
  if (db) return db;
  if (ready) return ready;

  ready = (async () => {
    const SQL = await initSqlJs();
    if (fs.existsSync(DB_PATH)) {
      const buffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(buffer);
    } else {
      db = new SQL.Database();
    }

    db.run(`
      CREATE TABLE IF NOT EXISTS drivers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        lat REAL,
        lng REAL
      )
    `);
    db.run(`
      CREATE TABLE IF NOT EXISTS deliveries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        address TEXT NOT NULL,
        lat REAL,
        lng REAL,
        expected_delivery_time TEXT,
        driver_id INTEGER REFERENCES drivers(id),
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'on_route', 'delayed', 'delivered')),
        recipient_phone TEXT,
        recipient_name TEXT,
        monday_item_id TEXT
      )
    `);

    save();
    return db;
  })();

  return ready;
}

function save() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// Helper: run a SELECT and return array of row objects
function allRows(db, sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

// Helper: run a SELECT and return first row object or null
function getRow(db, sql, params = []) {
  const rows = allRows(db, sql, params);
  return rows.length > 0 ? rows[0] : null;
}

module.exports = { getDb, save, allRows, getRow };
