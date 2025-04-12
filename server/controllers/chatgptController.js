// server/controllers/chatgptController.js
const Save = require('../models/Save'); // Import the Save model

exports.saveChatGPTContent = async (req, res) => {
    console.log("[WTHAI:ChatGPTController:saveContent] Function entry.");
    const { userId, url } = req.body; // platform is already confirmed by saveController

    if (!userId || !url) {
        // This check is technically redundant if saveController validates, but good practice
        console.error('[WTHAI:ChatGPTController:saveContent] Missing userId or url.');
        return res.status(400).send({ message: 'UserId and URL are required.' });
    }

    console.log(`[WTHAI:ChatGPTController:saveContent] Attempting to save URL: ${url} for UserID: ${userId}`);

    try {
        // Find the user's save document or create a new one if it doesn't exist
        let userSaves = await Save.findOne({ userId: userId });

        if (!userSaves) {
            console.log(`[WTHAI:ChatGPTController:saveContent] No existing Save document found for UserID: ${userId}. Creating new one.`);
            userSaves = new Save({ userId: userId, chatgpt: [] }); // Initialize with empty array
        } else {
             console.log(`[WTHAI:ChatGPTController:saveContent] Found existing Save document for UserID: ${userId}.`);
             // Ensure the chatgpt array exists if the document was created before the field was added
             if (!userSaves.chatgpt) {
                 userSaves.chatgpt = [];
             }
        }

        // Check if the URL already exists in the chatgpt array
        const urlExists = userSaves.chatgpt.some(item => item.url === url);

        if (urlExists) {
            console.log(`[WTHAI:ChatGPTController:saveContent] URL already exists for UserID: ${userId}. URL: ${url}`);
            // Optionally, update the savedAt timestamp? For now, just confirm it's saved.
             // Find the existing item and update its savedAt timestamp
             const existingItemIndex = userSaves.chatgpt.findIndex(item => item.url === url);
             if (existingItemIndex !== -1) {
                 userSaves.chatgpt[existingItemIndex].savedAt = new Date();
                 console.log(`[WTHAI:ChatGPTController:saveContent] Updated savedAt timestamp for existing URL.`);
             }
            await userSaves.save();
            return res.status(200).send({ message: 'ChatGPT link already saved.', savedUrl: url });
        } else {
            console.log(`[WTHAI:ChatGPTController:saveContent] URL does not exist. Adding to chatgpt array for UserID: ${userId}.`);
            // Add the new URL object to the chatgpt array
             const newItem = { url: url, savedAt: new Date() };
             userSaves.chatgpt.push(newItem);

            // Save the updated document
            await userSaves.save();
            console.log(`[WTHAI:ChatGPTController:saveContent] Successfully saved new ChatGPT URL for UserID: ${userId}.`);
            return res.status(201).send({ message: 'ChatGPT link saved successfully.', savedItem: newItem });
        }

    } catch (error) {
        console.error(`[WTHAI:ChatGPTController:saveContent] Error saving ChatGPT link for UserID: ${userId}. URL: ${url}. Error:`, error);
        // Handle potential duplicate key errors during initial creation (though findOne/upsert pattern mitigates this)
        if (error.code === 11000) {
             return res.status(409).send({ message: 'Conflict: Error saving data.', error: error.message });
        }
        res.status(500).send({ message: 'Failed to save ChatGPT link.', error: error.message });
    }
     console.log("[WTHAI:ChatGPTController:saveContent] Function exit.");
}; 