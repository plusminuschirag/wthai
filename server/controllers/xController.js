const Save = require('../models/Save');

exports.saveXContent = async (req, res) => {
  // Assume userId is added to req by upstream middleware (e.g., authentication)
  // const { userId } = req; // OLD: Assume userId from middleware
  const { url, userId } = req.body; // NEW: Get userId and url from request body

  if (!userId) {
    console.error('User ID missing in request body'); // Updated error message
    return res.status(401).send({ message: 'User authentication required' });
  }

  if (!url) {
    return res.status(400).send({ message: 'URL is required for platform X' });
  }

  try {
    // Find the user's save document, or create it if it doesn't exist
    let userSaves = await Save.findOne({ userId: userId });

    if (!userSaves) {
      console.log(`No save document found for userId: ${userId}. Creating one.`);
      userSaves = new Save({ userId: userId, x: [] });
    }

    // Check if this URL already exists in the user's 'x' saves
    const alreadyExists = userSaves.x.some(item => item.url === url);

    if (alreadyExists) {
      console.log(`URL already saved for user ${userId}: ${url}`);
      return res.status(200).send({ message: 'URL already saved', platform: 'x', url: url });
    }

    // Add the new content (just the URL) to the 'x' array
    const newContent = {
      url,
      // savedAt is handled by default in the schema
    };
    
    userSaves.x.push(newContent);

    // Save the updated document
    await userSaves.save();

    console.log(`Saved X content URL for user ${userId}: ${url}`);
    // Return only the essential info in the response
    res.status(201).send({ message: 'X content saved successfully', platform: 'x', url: url });

  } catch (error) {
    console.error(`Error saving X content for user ${userId}:`, error);
    // Handle potential duplicate key error during initial creation if unique index fails
    if (error.code === 11000) { 
      res.status(409).send({ message: 'Conflict creating user save document. Please retry.' });
    } else {
      res.status(500).send({ message: 'Error saving content', error: error.message });
    }
  }
}; 