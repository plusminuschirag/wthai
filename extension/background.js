// background.js
console.log("[WTHAI:Background] Service Worker Loaded");

const BACKEND_URL = 'https://server-42463408610.us-central1.run.app';
const BACKEND_SAVE_URL = `${BACKEND_URL}/save`;

// Listen for messages from content scripts or other parts of the extension
// Make the listener async to use await
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("[WTHAI:Background:onMessage] Received message:", message, "From sender:", sender);

    if (message.action === "saveBookmark" && message.url && message.platform) {
        console.log(`[WTHAI:Background:onMessage] Handling 'saveBookmark' for platform: ${message.platform}, URL: ${message.url}`);

        // --- Get User ID from Storage --- asynchronous operation
        (async () => {
            try {
                const storageData = await new Promise((resolve) => {
                    chrome.storage.local.get('userInfo', resolve);
                });

                console.log("[WTHAI:Background:onMessage] Retrieved from storage:", storageData);

                // --- Check for userInfo and specifically userInfo.userId ---
                if (!storageData.userInfo || !storageData.userInfo.userId) { 
                    console.error("[WTHAI:Background:onMessage] User info or userId property not found in storage.", storageData);
                    sendResponse({ status: "error", message: "User not signed in or user info missing from storage (userId property missing)." });
                    return; // Stop processing
                }

                // --- Use userInfo.userId --- 
                const userId = storageData.userInfo.userId;
                console.log("[WTHAI:Background:onMessage] Obtained userId from storage:", userId);

                // --- Prepare Payload ---
                const payload = {
                    platform: message.platform,
                    url: message.url,
                    userId: userId
                };
                console.log("[WTHAI:Background:onMessage] Prepared payload for backend:", payload);

                // --- Call Backend API using await ---
                console.log(`[WTHAI:Background:onMessage] Sending fetch request to backend: ${BACKEND_SAVE_URL}`);
                const response = await fetch(BACKEND_SAVE_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                console.log("[WTHAI:Background:onMessage] Received response from backend fetch.", response);

                if (!response.ok) {
                    console.error(`[WTHAI:Background:onMessage] Backend response not OK (${response.status}). Attempting to read response text...`);
                    const errorText = await response.text();
                    console.error(`[WTHAI:Background:onMessage] Backend error response text:`, errorText);
                    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                }

                console.log("[WTHAI:Background:onMessage] Backend response OK. Attempting to parse JSON...");
                const data = await response.json();
                console.log("[WTHAI:Background:onMessage] Successfully parsed backend JSON response:", data);

                // --- Send success response back to the caller (content script) ---
                sendResponse({ status: "success", data: data });

            } catch (error) {
                console.error(`[WTHAI:Background:onMessage] Error during storage access or backend fetch for user:`, error);
                // Ensure userId is defined for the error message, or provide a default
                // Use the correctly accessed userId variable here
                const userIdForError = (typeof userId !== 'undefined' && userId) ? userId : 'unknown';
                sendResponse({ status: "error", message: `Error processing bookmark for user ${userIdForError}: ${error.message}` });
            }
        })(); // Immediately invoke the async function

        // Return true to indicate you will send a response asynchronously
        return true;
    }

    console.log("[WTHAI:Background:onMessage] Message not handled by this listener (action !== 'saveBookmark' or missing fields). Returning false/undefined.");
    // Return false or undefined if the message wasn't handled or was handled synchronously (which isn't the case here anymore)
    return false; 
});