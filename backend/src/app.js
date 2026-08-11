const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { clientOrigin } = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const formRoutes = require('./routes/formRoutes');
const publicRoutes = require('./routes/publicRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const { ok } = require('./utils/apiResponse');

const app = express();

app.use(helmet());
app.use(cors({ origin: clientOrigin, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => ok(res, { status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/public', publicRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
