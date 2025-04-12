// background.js
console.log("Background Service Worker Loaded");

// const BACKEND_URL = 'http://localhost:3000/bookmarks/save'; // OLD ENDPOINT
const BACKEND_URL = 'http://localhost:3000/save'; // Generic save endpoint

// Listen for messages from content scripts or other parts of the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Check if the message action is for saving a specific type of bookmark
    if (message.action === "saveBookmark" && message.url && message.platform) {
        console.log(`Background script received ${message.platform} URL to save:`, message.url);

        // --- Get User ID --- 
        chrome.identity.getProfileUserInfo({ accountStatus: 'ANY' }, (userInfo) => {
            if (chrome.runtime.lastError || !userInfo || !userInfo.id) {
                console.error("Error getting user info or user not signed in:", chrome.runtime.lastError?.message);
                sendResponse({ status: "error", message: "User not signed in or error fetching user info." });
                return; // Stop processing if user ID can't be obtained
            }

            const userId = userInfo.id; // Google User ID (sub)
            console.log("Obtained userId:", userId);

            // --- Prepare Payload --- 
            const payload = {
                platform: message.platform, // Use platform from the message
                url: message.url,
                userId: userId // Include the authenticated user's Google ID
            };

            // --- Call Backend API --- 
            fetch(BACKEND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload), // Send the payload with platform, url, and userId
            })
            .then(response => {
                if (!response.ok) {
                    // If response is not ok, read the response body as text for more details
                    return response.text().then(text => { 
                        throw new Error(`HTTP error! status: ${response.status}, message: ${text}`); 
                    });
                }
                return response.json(); // Assuming the server responds with JSON
            })
            .then(data => {
                console.log("Backend response:", data);
                sendResponse({ status: "success", data: data });
            })
            .catch(error => {
                console.error(`Error sending content to backend for user ${userId}:`, error);
                sendResponse({ status: "error", message: error.message });
            });
        });

        // Return true to indicate that sendResponse will be called asynchronously
        return true; 
    }
    // Return false if this listener doesn't handle the message type
    return false;
}); 