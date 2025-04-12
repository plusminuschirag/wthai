const Save = require('../models/Save');

exports.saveRedditContent = async (req, res) => {
  const { url, userId, platform } = req.body; // platform is passed for consistency

  if (!userId) {
    console.error('User ID missing in request body for Reddit save');
    return res.status(401).send({ message: 'User authentication required' });
  }

  if (!url) {
    return res.status(400).send({ message: 'URL is required for platform Reddit' });
  }

  // Explicitly check if the platform is indeed 'reddit'
  if (platform !== 'reddit') {
    console.warn(`redditController received unexpected platform: ${platform}`);
    // Optional: Could redirect or send specific error, but 400 is okay
    return res.status(400).send({ message: `Invalid platform for this controller: ${platform}` });
  }

  try {
    // Find the user's save document, or create it if it doesn't exist
    let userSaves = await Save.findOne({ userId: userId });

    if (!userSaves) {
      console.log(`No save document found for userId: ${userId}. Creating one.`);
      // Initialize with an empty 'reddit' array
      userSaves = new Save({ userId: userId, reddit: [] });
    } else if (!userSaves.reddit) {
       // If the document exists but 'reddit' array doesn't, initialize it
       console.log(`Initializing 'reddit' array for userId: ${userId}.`);
       userSaves.reddit = [];
    }

    // Check if this URL already exists in the user's 'reddit' saves
    // Assuming items in the array are objects like { url: '...', savedAt: '...' }
    const alreadyExists = userSaves.reddit.some(item => item.url === url);

    if (alreadyExists) {
      console.log(`Reddit URL already saved for user ${userId}: ${url}`);
      return res.status(200).send({ message: 'URL already saved', platform: 'reddit', url: url });
    }

    // Add the new content (just the URL) to the 'reddit' array
    const newContent = {
      url,
      // savedAt is handled by default in the schema if defined there
    };

    userSaves.reddit.push(newContent);

    // Save the updated document
    await userSaves.save();

    console.log(`Saved Reddit content URL for user ${userId}: ${url}`);
    res.status(201).send({ message: 'Reddit content saved successfully', platform: 'reddit', url: url });

  } catch (error) {
    console.error(`Error saving Reddit content for user ${userId}:`, error);
    if (error.code === 11000) { // Handle potential duplicate key on initial create
      res.status(409).send({ message: 'Conflict creating user save document. Please retry.' });
    } else {
      res.status(500).send({ message: 'Error saving content', error: error.message });
    }
  }
}; 