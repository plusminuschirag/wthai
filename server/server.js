require('dotenv').config(); // Load .env file variables
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Import mongoose
const userRoutes = require('./routes/userRoutes'); // Import user routes

const app = express();
const PORT = process.env.PORT || 3000; // Use port from .env or default to 3000
const mongoUri = process.env.MONGODB_URI; // Get URI from .env

// --- Database Connection ---
if (!mongoUri) {
  console.error("FATAL ERROR: MONGODB_URI is not defined in .env file.");
  process.exit(1); // Exit if DB connection string is missing
}

mongoose.connect(mongoUri)
  .then(() => console.log('MongoDB connected successfully.'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit on connection error
  });

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error event:', err);
});
// --- End Database Connection ---


// Enable CORS for all origins
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Mount the user routes
app.use('/user', userRoutes); // All routes defined in userRoutes will be prefixed with /user

// Keep the root route for basic check (optional)
app.get('/', (req, res) => {
  res.send('Hello from the Express server!');
});

app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}/`);
}); 