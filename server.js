const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const connectDB = require('./config/db');
const adminRoutes = require('./routes/admin');
const taskRoutes = require('./routes/task');
const customerRoutes = require('./routes/customer');
const materialRoutes = require('./routes/material');
const approvalRoutes = require('./routes/approval');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/approvals', approvalRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to KUSCO API' });
});

// Start server (only in non-serverless environment)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
