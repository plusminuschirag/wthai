// server/controllers/userController.js
const User = require('../models/User'); // Import the User model

// Save or Update user details
const saveUser = async (req, res) => { // Make function async
  const { userId, name, email, picture } = req.body;

  if (!userId || !email || !name) { // Ensure core fields are present
    return res.status(400).send({ error: 'User ID, email, and name are required.' });
  }

  try {
    // Find user by Google ID (userId) and update, or create if not found (upsert)
    // Also updates the lastLoginAt field due to the pre-save hook in the model
    const updatedUser = await User.findOneAndUpdate(
      { userId: userId }, // Find condition
      { 
        $set: { // Fields to set/update
          email: email.toLowerCase(), // Ensure lowercase
          name: name,
          picture: picture,
          lastLoginAt: new Date() // Explicitly set last login on update
        },
        $setOnInsert: { // Fields to set only when creating a new document
            createdAt: new Date()
        }
      },
      { 
        upsert: true, // Create if document doesn't exist
        new: true, // Return the updated document
        runValidators: true // Ensure schema validation runs on update
      } 
    );

    console.log(`User data saved/updated for userId: ${userId}`);
    res.status(200).send({ message: 'User data synced successfully.', user: updatedUser }); // Send 200 OK for upsert

  } catch (error) {
    console.error(`Error saving/updating user ${userId}:`, error);
    // Handle potential duplicate key errors (e.g., email already exists for different userId)
     if (error.code === 11000) {
         return res.status(409).send({ error: 'Conflict: Email or User ID may already be associated with another account.' });
     }
    res.status(500).send({ error: 'Failed to save user data.' });
  }
};

// Fetch user details by Google User ID
const getUser = async (req, res) => { // Make function async
  const { userId } = req.query; // Get Google User ID from query parameter

  if (!userId) {
    return res.status(400).send({ error: 'User ID query parameter is required.' });
  }

  try {
    const userData = await User.findOne({ userId: userId }); // Find by Google ID

    if (userData) {
      res.status(200).send(userData);
    } else {
      res.status(404).send({ error: 'User data not found.' });
    }
  } catch (error) {
    console.error(`Error fetching user ${userId}:`, error);
    res.status(500).send({ error: 'Failed to fetch user data.' });
  }
};

module.exports = {
  saveUser,
  getUser,
}; 