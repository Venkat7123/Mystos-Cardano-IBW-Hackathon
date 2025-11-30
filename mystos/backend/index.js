require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');
const txRoutes = require('./routes/tx');
const ratingRoutes = require('./routes/rating');
const daoRoutes = require('./routes/dao');
const midnightRoutes = require('./routes/midnight');

const db = require('./db');
const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

app.get('/health', (req, res) => res.json({ ok: true }));

app.use('/auth', authRoutes);
app.use('/wallet', walletRoutes);
app.use('/tx', txRoutes);
app.use('/rating', ratingRoutes);
app.use('/dao', daoRoutes);
app.use('/midnight', midnightRoutes);

app.get('/', (req, res) => res.json({ ok: true, message: 'Mystos Backend is running' }));
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});