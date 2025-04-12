const Save = require('../models/Save');

exports.saveLinkedInPost = async (req, res) => {
  console.log("[WTHAI:LinkedInController:saveLinkedInPost] Function entry.");
  const { url, userId } = req.body;
  console.log(`[WTHAI:LinkedInController:saveLinkedInPost] Received: userId=${userId}, url=${url}`);

  if (!userId) {
    console.error('[WTHAI:LinkedInController:saveLinkedInPost] Validation failed: User ID missing.');
    return res.status(401).send({ message: 'User authentication required' });
  }

  if (!url) {
    console.error('[WTHAI:LinkedInController:saveLinkedInPost] Validation failed: URL missing.');
    return res.status(400).send({ message: 'URL is required for platform LinkedIn' });
  }

  try {
    console.log(`[WTHAI:LinkedInController:saveLinkedInPost] Attempting to find save document for userId: ${userId}`);
    let userSaves = await Save.findOne({ userId: userId });

    if (!userSaves) {
      console.log(`[WTHAI:LinkedInController:saveLinkedInPost] No save document found for userId: ${userId}. Creating one...`);
      userSaves = new Save({ userId: userId, linkedin: [] });
      console.log(`[WTHAI:LinkedInController:saveLinkedInPost] New save document instance created (not saved yet).`);
    } else {
      console.log(`[WTHAI:LinkedInController:saveLinkedInPost] Found existing save document for userId: ${userId}`);
      // Ensure the linkedin array exists if the document was created before the field was added
      if (!userSaves.linkedin) {
          console.log(`[WTHAI:LinkedInController:saveLinkedInPost] Existing document missing 'linkedin' array. Initializing.`);
          userSaves.linkedin = [];
      }
    }

    console.log(`[WTHAI:LinkedInController:saveLinkedInPost] Checking if URL already exists: ${url}`);
    const alreadyExists = userSaves.linkedin.some(item => item.url === url);

    if (alreadyExists) {
      console.log(`[WTHAI:LinkedInController:saveLinkedInPost] URL already exists for user ${userId}: ${url}`);
      return res.status(200).send({ message: 'URL already saved', platform: 'linkedin', url: url });
    }

    console.log(`[WTHAI:LinkedInController:saveLinkedInPost] URL is new. Preparing to push.`);
    const newContent = {
      url,
      // savedAt is handled by default in the schema
    };

    userSaves.linkedin.push(newContent);
    console.log(`[WTHAI:LinkedInController:saveLinkedInPost] Pushed new URL to linkedin array.`);

    console.log(`[WTHAI:LinkedInController:saveLinkedInPost] Attempting to save document...`);
    await userSaves.save();
    console.log(`[WTHAI:LinkedInController:saveLinkedInPost] Document saved successfully.`);

    console.log(`[WTHAI:LinkedInController:saveLinkedInPost] Sending success response.`);
    res.status(201).send({ message: 'LinkedIn content saved successfully', platform: 'linkedin', url: url });

  } catch (error) {
    console.error(`[WTHAI:LinkedInController:saveLinkedInPost] Error saving LinkedIn content for user ${userId}:`, error);
    if (error.code === 11000) {
      console.error('[WTHAI:LinkedInController:saveLinkedInPost] MongoDB duplicate key error (11000).');
      res.status(409).send({ message: 'Conflict creating user save document. Please retry.' });
    } else {
      console.error(`[WTHAI:LinkedInController:saveLinkedInPost] Generic error: ${error.message}`);
      res.status(500).send({ message: 'Error saving content', error: error.message });
    }
  }
}; 