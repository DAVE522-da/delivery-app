const express = require('express');
const cors = require('cors');
const deliveriesRouter = require('./routes/deliveries');
const driversRouter = require('./routes/drivers');
const mondayRouter = require('./routes/monday');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/deliveries', deliveriesRouter);
app.use('/api/drivers', driversRouter);
app.use('/api/monday', mondayRouter);

app.listen(PORT, () => {
  console.log(`Delivery API running on http://localhost:${PORT}`);
});
