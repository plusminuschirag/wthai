// server/controllers/userController.js
const User = require('../models/User'); // Import the User model
const Save = require('../models/Save'); // Import the Save model

// Helper function to get save counts
const getSaveCounts = async (userId) => {
  if (!userId) return { x: 0, reddit: 0, linkedin: 0 }; // Return zero counts if no userId
  try {
    const saves = await Save.findOne({ userId: userId }).select('x reddit linkedin'); // Select only needed fields
    return {
      x: saves?.x?.length || 0,
      reddit: saves?.reddit?.length || 0,
      linkedin: saves?.linkedin?.length || 0,
    };
  } catch (error) {
    console.error(`Error fetching save counts for user ${userId}:`, error);
    return { x: 0, reddit: 0, linkedin: 0 }; // Return zero counts on error
  }
};

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
    ).lean(); // Use .lean() for a plain JS object, makes adding properties easier

    if (!updatedUser) {
        // Should not happen with upsert: true, but good practice
        return res.status(500).send({ error: 'Failed to save or find user data.' });
    }

    // Fetch save counts
    const counts = await getSaveCounts(userId);

    // Combine user data and counts
    const responseData = {
        ...updatedUser,
        metrics: counts
    };

    console.log(`User data saved/updated for userId: ${userId}, Counts:`, counts);
    res.status(200).send({ message: 'User data synced successfully.', user: responseData }); // Send combined data

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
    const userData = await User.findOne({ userId: userId }).lean(); // Use .lean()

    if (userData) {
      // Fetch save counts
      const counts = await getSaveCounts(userId);
       // Combine user data and counts
      const responseData = {
        ...userData,
        metrics: counts
      };
      console.log(`User data fetched for userId: ${userId}, Counts:`, counts);
      res.status(200).send(responseData); // Send combined data
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