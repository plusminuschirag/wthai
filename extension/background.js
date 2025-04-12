// background.js
console.log("Background Service Worker Loaded");

// const BACKEND_URL = 'http://localhost:3000/bookmarks/save'; // OLD ENDPOINT
const BACKEND_URL = 'http://localhost:3000/save'; // NEW generic save endpoint

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Check if the message is specifically for saving an X bookmark
    if (message.action === "saveBookmark" && message.url) { 
        console.log("Background script received X URL:", message.url);

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
                platform: 'x', 
                url: message.url,
                userId: userId // ADDED: Include the user ID
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

        // Return true because the response is sent asynchronously AFTER getProfileUserInfo completes
        return true; 
    }
    // Handle other potential messages or return false if not handled
    return false;
}); 