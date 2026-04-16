require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const packageRoutes = require('./routes/packages');
const testRoutes = require('./routes/tests');
const rbacRoutes = require('./routes/rbac');
const editorRoutes = require('./routes/editor');
const workflowRoutes = require('./routes/workflows');
const { authenticateToken, errorHandler } = require('./middleware/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/packages', authenticateToken, packageRoutes);
app.use('/api/tests', authenticateToken, testRoutes);
app.use('/api/rbac', authenticateToken, rbacRoutes);
app.use('/api/editor', authenticateToken, editorRoutes);
app.use('/api/workflows', authenticateToken, workflowRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Developer Portal Backend running on port ${PORT}`);
});

module.exports = app;
