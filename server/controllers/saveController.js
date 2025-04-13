const { supabaseClient } = require('../config/supabase.js'); // Import Supabase client
const { SUPPORTED_PLATFORMS } = require('../config/constants.js'); // Import constants

// const SUPPORTED_PLATFORMS = ['x', 'reddit', 'linkedin', 'chatgpt']; // Use the enum values from migration

exports.saveContent = async (req, res) => { // Make function async
  console.log("[WTHAI:SaveController:saveContent] Function entry.");
  const { platform, userId, url } = req.body;

  console.log(`[WTHAI:SaveController:saveContent] Received request: Platform=${platform}, UserId=${userId ? 'Present' : 'Missing'}, Url=${url}`);

  // Basic validation
  if (!platform || !userId || !url) {
    console.error('[WTHAI:SaveController:saveContent] Validation failed: Missing platform, userId, or url.');
    return res.status(400).send({ message: 'Platform, userId, and url are required.' });
  }

  // Validate platform
  if (!SUPPORTED_PLATFORMS.includes(platform.toLowerCase())) {
      console.warn(`[WTHAI:SaveController:saveContent] Unsupported platform received: ${platform}`);
      return res.status(400).send({ message: `Platform '${platform}' not supported.` });
  }

  try {
    // Attempt to insert the new saved item into the Supabase table
    const { data, error } = await supabaseClient
      .from('SavedItem')
      .insert({
        userId: userId,
        platform: platform.toLowerCase(), // Ensure consistent casing, matching ENUM
        url: url,
        // savedAt will be set by default in the database
      })
      .select() // Optionally select the inserted row
      .single(); // Expect a single row returned

    if (error) {
      console.error(`[WTHAI:SaveController:saveContent] Supabase error saving item for user ${userId}, platform ${platform}:`, error);
      // Check for unique constraint violation (user already saved this URL for this platform)
      if (error.code === '23505') { // PostgreSQL unique violation
          // You might want to check error.details or error.message to be sure it's the correct constraint
          console.log(`[WTHAI:SaveController:saveContent] Item already saved for user ${userId}, platform ${platform}, url ${url}`);
          return res.status(409).send({ message: 'Item already saved.' });
      }
      // Check for foreign key violation (userId doesn't exist in User table)
      if (error.code === '23503') { 
           console.error(`[WTHAI:SaveController:saveContent] Foreign key violation: User ID ${userId} not found.`);
           return res.status(400).send({ message: 'Invalid User ID provided.' });
      }
      // Handle other potential errors
      return res.status(500).send({ message: 'Failed to save item.' });
    }

    console.log(`[WTHAI:SaveController:saveContent] Successfully saved item for user ${userId}, platform ${platform}. Item ID: ${data?.itemId}`);
    res.status(201).send({ message: 'Item saved successfully.', savedItem: data }); // Send 201 Created

  } catch (err) {
    // Catch unexpected errors
    console.error(`[WTHAI:SaveController:saveContent] Unexpected error saving item for user ${userId}, platform ${platform}:`, err);
    res.status(500).send({ message: 'An unexpected error occurred while saving the item.' });
  }
};

// Get all saved items for a specific user
exports.getSavedItemsByUser = async (req, res) => {
  console.log("[WTHAI:SaveController:getSavedItemsByUser] Function entry.");
  const { userId } = req.params; // Get userId from route parameters

  console.log(`[WTHAI:SaveController:getSavedItemsByUser] Received request for userId: ${userId}`);

  if (!userId) {
    console.error('[WTHAI:SaveController:getSavedItemsByUser] Validation failed: Missing userId.');
    return res.status(400).send({ message: 'User ID is required.' });
  }

  try {
    const { data, error } = await supabaseClient
      .from('SavedItem')
      .select('itemId, platform, url, savedAt') // Select specific columns
      .eq('userId', userId) // Filter by userId
      .order('savedAt', { ascending: false }); // Order by newest first

    if (error) {
      console.error(`[WTHAI:SaveController:getSavedItemsByUser] Supabase error fetching items for user ${userId}:`, error);
      // Handle specific errors if needed, e.g., invalid userId format
      return res.status(500).send({ message: 'Failed to retrieve saved items.' });
    }

    if (!data) {
        console.log(`[WTHAI:SaveController:getSavedItemsByUser] No saved items found for user ${userId}`);
        return res.status(404).send({ message: 'No saved items found for this user.', items: [] });
    }

    console.log(`[WTHAI:SaveController:getSavedItemsByUser] Successfully retrieved ${data.length} items for user ${userId}`);
    res.status(200).send({ items: data }); // Send the array of items

  } catch (err) {
    console.error(`[WTHAI:SaveController:getSavedItemsByUser] Unexpected error fetching items for user ${userId}:`, err);
    res.status(500).send({ message: 'An unexpected error occurred while retrieving saved items.' });
  }
}; 