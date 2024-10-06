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
app.use(express.urlencoded({ limit: '50mb' }));

app.get('/api/welcome', (req, res) => {
  res.send("Welcome to the backend, if you see this, it means we are live");
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/completion', completionRoutes);

// Error handling middleware
app.use(errorMiddleware);

// Connect to MongoDB
mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start server
const PORT = config.port || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));