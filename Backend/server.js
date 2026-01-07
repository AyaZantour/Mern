const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorMiddleware');

// Route files
const questionRoutes = require('./routes/questionRoutes');
const testRoutes = require('./routes/testRoutes');
const sendTestRoutes = require('./routes/sendTestRoutes');
const candidateTestRoutes = require('./routes/candidateTestRoutes');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount routers
app.use('/api/questions', questionRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/send-test', sendTestRoutes);
app.use('/api/candidate-tests', candidateTestRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.json({
    message: 'AI-Powered IT Recruiter Question Generator API',
    version: '1.0.0'
  });
});

// 404 handler - MUST be after all other routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` API Documentation: http://localhost:${PORT}`);
});