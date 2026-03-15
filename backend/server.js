const express = require('express');
const cors = require('cors');
const deliveriesRouter = require('./routes/deliveries');
const driversRouter = require('./routes/drivers');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/deliveries', deliveriesRouter);
app.use('/api/drivers', driversRouter);

app.listen(PORT, () => {
  console.log(`Delivery API running on http://localhost:${PORT}`);
});
