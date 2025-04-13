require('dotenv').config(); // Load .env file variables
const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes'); // Import user routes
// const bookmarkRoutes = require('./routes/bookmarkRoutes'); // REMOVED: Old import
const saveRoutes = require('./routes/saveRoutes'); // ADDED: New import for generic save

const app = express();
const PORT = process.env.PORT || 3000; // Use port from .env or default to 3000

// Enable CORS for all origins
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Mount the user routes
app.use('/user', userRoutes); // All routes defined in userRoutes will be prefixed with /user

// ADDED: Mount the generic save route
app.use('/', saveRoutes); // Mount save route at the root

// Keep the root route for basic check (optional)
app.get('/', (req, res) => {
  res.send('Hello from the Express server!');
});

app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}/`);
}); 