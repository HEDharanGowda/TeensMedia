require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const moderationRoutes = require('./routes/moderationRoutes');
const postRoutes = require('./routes/postRoutes');
const userRoutes = require('./routes/userRoutes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api', moderationRoutes);
app.use('/api', postRoutes);
app.use('/api', userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
