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