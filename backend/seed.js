const { getDb, save } = require('./db');

async function seed() {
  const db = await getDb();

  // Clear existing data
  db.run('DELETE FROM deliveries');
  db.run('DELETE FROM drivers');

  // Seed drivers
  const drivers = [
    ['Alex Rivera', '212-555-0101', 40.7580, -73.9855],
    ['Maria Chen', '212-555-0102', 40.7484, -73.9856],
    ['James Wilson', '212-555-0103', 40.7614, -73.9776],
  ];

  const driverIds = [];
  for (const [name, phone, lat, lng] of drivers) {
    db.run('INSERT INTO drivers (name, phone, lat, lng) VALUES (?, ?, ?, ?)', [name, phone, lat, lng]);
    const row = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0];
    driverIds.push(row);
  }

  // Seed deliveries
  const deliveries = [
    ['350 Fifth Ave, New York, NY 10118',        40.7484, -73.9856, '2026-03-15T10:00:00', driverIds[0], 'pending',   '212-555-1001', 'Sarah Johnson'],
    ['20 W 34th St, New York, NY 10001',         40.7488, -73.9854, '2026-03-15T10:30:00', driverIds[0], 'on_route',  '212-555-1002', 'Mike Peters'],
    ['1 Times Sq, New York, NY 10036',           40.7580, -73.9855, '2026-03-15T11:00:00', driverIds[0], 'pending',   '212-555-1003', 'Emma Davis'],
    ['30 Rockefeller Plaza, New York, NY 10112', 40.7587, -73.9787, '2026-03-15T09:30:00', driverIds[1], 'delivered', '212-555-1004', 'John Smith'],
    ['11 W 53rd St, New York, NY 10019',         40.7614, -73.9776, '2026-03-15T11:30:00', driverIds[1], 'on_route',  '212-555-1005', 'Lisa Wang'],
    ['1000 5th Ave, New York, NY 10028',         40.7794, -73.9632, '2026-03-15T12:00:00', driverIds[1], 'delayed',   '212-555-1006', 'Tom Brown'],
    ['Central Park West, New York, NY 10024',    40.7812, -73.9740, '2026-03-15T12:30:00', driverIds[1], 'pending',   '212-555-1007', 'Amy Lee'],
    ['200 Central Park S, New York, NY 10019',   40.7658, -73.9793, '2026-03-15T13:00:00', driverIds[2], 'pending',   '212-555-1008', 'Chris Martin'],
    ['405 Lexington Ave, New York, NY 10174',    40.7517, -73.9755, '2026-03-15T13:30:00', driverIds[2], 'delayed',   '212-555-1009', 'Rachel Green'],
    ['89 E 42nd St, New York, NY 10017',         40.7527, -73.9772, '2026-03-15T14:00:00', driverIds[2], 'delivered', '212-555-1010', 'David Kim'],
  ];

  for (const [address, lat, lng, time, driverId, status, phone, name] of deliveries) {
    db.run(
      'INSERT INTO deliveries (address, lat, lng, expected_delivery_time, driver_id, status, recipient_phone, recipient_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [address, lat, lng, time, driverId, status, phone, name]
    );
  }

  save();
  console.log(`Seeded ${driverIds.length} drivers and ${deliveries.length} deliveries.`);
}

seed().catch(console.error);
