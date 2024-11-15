const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('./config/config');
const errorMiddleware = require('./middleware/errorMiddleware');

const userRoutes = require('./routes/userRoute');
const conversationRoutes = require('./routes/conversationRoute');
const aiRoutes = require('./routes/aiRoute');
const completionRoutes = require('./routes/completionRoute');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/api/welcome', (req, res) => {
  res.send("Welcome to the course ai backend (server.js), if you see this, it means we are live!");
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/completion', completionRoutes);

// Error handling middleware
app.use(errorMiddleware);

// Connect to MongoDB
mongoose.connect(config.mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = config.port || 4000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Handle server startup errors
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  switch (error.code) {
    case 'EACCES':
      console.error(`Port ${PORT} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`Port ${PORT} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});