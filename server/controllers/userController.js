// server/controllers/userController.js
const { supabaseClient } = require('../config/supabase.js'); // Import Supabase client using destructuring
const { SUPPORTED_PLATFORMS } = require('../config/constants.js'); // Import constants

// Helper function to get save counts from Supabase using RPC
const getSaveCounts = async (userId) => {
  // Initialize final counts object
  const finalCounts = {};

  // If no userId provided, return 0 for all known platforms
  if (!userId) {
    SUPPORTED_PLATFORMS.forEach(platform => {
        finalCounts[platform] = 0;
    });
    return finalCounts;
  }

  try {
    // Call the database function to get counts efficiently
    const { data, error } = await supabaseClient.rpc('get_save_counts_for_user', { p_userid: userId });

    if (error) {
      console.error(`[WTHAI:UserCtrl:getSaveCounts] Supabase RPC error for user ${userId}:`, error);
      // Return empty counts on error (frontend will handle missing keys)
      return finalCounts;
    }

    // Populate the counts directly from the RPC result
    if (data) {
        data.forEach(item => {
            // Directly add the platform and count from the DB result
            finalCounts[item.platform] = Number(item.count) || 0;
        });
    }
    
    // Ensure all supported platforms have a key, even if 0 (for consistency, balancing simplification with predictability)
    SUPPORTED_PLATFORMS.forEach(platform => {
        if (!finalCounts.hasOwnProperty(platform)) {
            finalCounts[platform] = 0;
        }
    });

    console.log(`[WTHAI:UserCtrl:getSaveCounts] Calculated counts via RPC for user ${userId}:`, finalCounts);
    return finalCounts;

  } catch (error) {
    console.error(`[WTHAI:UserCtrl:getSaveCounts] Unexpected error fetching save counts for user ${userId}:`, error);
    // Return empty counts on unexpected error
    return finalCounts;
  }
};

// Save or Update user details using Supabase
const saveUser = async (req, res) => {
  const { userId, name, email, picture } = req.body;

  if (!userId || !email || !name) {
    return res.status(400).send({ error: 'User ID, email, and name are required.' });
  }

  try {
    const { data: upsertedUser, error: upsertError } = await supabaseClient
      .from('User')
      .upsert(
        {
          userId: userId,
          email: email.toLowerCase(),
          name: name,
          picture: picture, // Will be null if not provided
          lastLoginAt: new Date().toISOString(), // Update last login time
        },
        {
          onConflict: 'userId', // Specify the conflict target (primary key)
          // Supabase automatically handles setting createdAt on insert via DEFAULT now()
        }
      )
      .select() // Select the inserted/updated row
      .single(); // Expect a single row

    if (upsertError) {
        console.error(`Supabase error saving/updating user ${userId}:`, upsertError);
        // Handle potential unique constraint violations (e.g., duplicate email if not the PK)
        if (upsertError.code === '23505') { // PostgreSQL unique violation code
             // Check if the conflict is on the email unique constraint
             if (upsertError.message.includes('User_email_key')) {
                return res.status(409).send({ error: 'Conflict: Email already associated with another account.' });
             }
             // Handle other potential unique conflicts if necessary
             return res.status(409).send({ error: 'Conflict: User data conflict.' });
        }
        return res.status(500).send({ error: 'Failed to save user data.' });
    }

    if (!upsertedUser) {
      // Should not happen with a successful upsert, but good practice
      return res.status(500).send({ error: 'Failed to save or retrieve user data after upsert.' });
    }

    // Fetch save counts
    const counts = await getSaveCounts(userId);

    // Combine user data and counts
    const responseData = {
      ...upsertedUser,
      metrics: counts,
    };

    console.log(`User data saved/updated via Supabase for userId: ${userId}, Counts:`, counts);
    res.status(200).send({ message: 'User data synced successfully.', user: responseData });

  } catch (error) {
    // Catch any unexpected errors during the process
    console.error(`Unexpected error saving/updating user ${userId}:`, error);
    res.status(500).send({ error: 'An unexpected error occurred.' });
  }
};

// Fetch user details by Google User ID using Supabase
const getUser = async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).send({ error: 'User ID query parameter is required.' });
  }

  try {
    const { data: userData, error: selectError } = await supabaseClient
      .from('User')
      .select('*') // Select all columns
      .eq('userId', userId) // Filter by userId
      .single(); // Expect only one matching row or null

    if (selectError) {
        // Differentiate between 'not found' (PGRST116) and other errors
        if (selectError.code === 'PGRST116') {
             console.log(`User data not found for userId: ${userId}`);
             return res.status(404).send({ error: 'User data not found.' });
        } else {
            console.error(`Supabase error fetching user ${userId}:`, selectError);
            return res.status(500).send({ error: 'Failed to fetch user data.' });
        }
    }

    if (userData) {
      // Fetch save counts
      const counts = await getSaveCounts(userId);
      // Combine user data and counts
      const responseData = {
        ...userData,
        metrics: counts,
      };
      console.log(`User data fetched via Supabase for userId: ${userId}, Counts:`, counts);
      res.status(200).send(responseData);
    } else {
       // This case should now be handled by the PGRST116 error check above,
       // but kept as a fallback.
       res.status(404).send({ error: 'User data not found.' });
    }
  } catch (error) {
    // Catch any unexpected errors during the process
    console.error(`Unexpected error fetching user ${userId}:`, error);
    res.status(500).send({ error: 'An unexpected error occurred.' });
  }
};

module.exports = {
  saveUser,
  getUser,
}; 