// background.js
console.log("[WTHAI:Background] Service Worker Loaded");

// const BACKEND_URL = 'http://localhost:3000/bookmarks/save'; // OLD ENDPOINT
const BACKEND_URL = 'http://localhost:3000/save'; // Generic save endpoint

// Listen for messages from content scripts or other parts of the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("[WTHAI:Background:onMessage] Received message:", message, "From sender:", sender);

    // Check if the message action is for saving a specific type of bookmark
    if (message.action === "saveBookmark" && message.url && message.platform) {
        console.log(`[WTHAI:Background:onMessage] Handling 'saveBookmark' for platform: ${message.platform}, URL: ${message.url}`);

        // --- Get User ID ---
        console.log("[WTHAI:Background:onMessage] Attempting to get user info...");
        chrome.identity.getProfileUserInfo({ accountStatus: 'ANY' }, (userInfo) => {
            console.log("[WTHAI:Background:onMessage] getProfileUserInfo callback executed.");
            if (chrome.runtime.lastError || !userInfo || !userInfo.id) {
                console.error("[WTHAI:Background:onMessage] Error getting user info or user not signed in:", chrome.runtime.lastError?.message, "UserInfo:", userInfo);
                sendResponse({ status: "error", message: "User not signed in or error fetching user info." });
                return; // Stop processing if user ID can't be obtained
            }

            const userId = userInfo.id; // Google User ID (sub)
            console.log("[WTHAI:Background:onMessage] Obtained userId:", userId);

            // --- Prepare Payload ---
            const payload = {
                platform: message.platform,
                url: message.url,
                userId: userId
            };
            console.log("[WTHAI:Background:onMessage] Prepared payload for backend:", payload);

            // --- Call Backend API ---
            console.log(`[WTHAI:Background:onMessage] Sending fetch request to backend: ${BACKEND_URL}`);
            fetch(BACKEND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            })
            .then(response => {
                console.log("[WTHAI:Background:onMessage] Received response from backend fetch.", response);
                if (!response.ok) {
                    console.error(`[WTHAI:Background:onMessage] Backend response not OK (${response.status}). Attempting to read response text...`);
                    return response.text().then(text => {
                        console.error(`[WTHAI:Background:onMessage] Backend error response text:`, text);
                        throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
                    });
                }
                console.log("[WTHAI:Background:onMessage] Backend response OK. Attempting to parse JSON...");
                return response.json();
            })
            .then(data => {
                console.log("[WTHAI:Background:onMessage] Successfully parsed backend JSON response:", data);
                sendResponse({ status: "success", data: data });
            })
            .catch(error => {
                console.error(`[WTHAI:Background:onMessage] Error during backend fetch or processing for user ${userId}:`, error);
                sendResponse({ status: "error", message: error.message });
            });
        });

        console.log("[WTHAI:Background:onMessage] Returning true to indicate async sendResponse.");
        return true;
    }

    console.log("[WTHAI:Background:onMessage] Message not handled by this listener (action !== 'saveBookmark' or missing fields). Returning false.");
    return false;
}); 