// content.js
console.log("[WTHAI:ContentScript] Script loaded.");

// Import platform-specific handlers
import { handleTwitter } from './controllers/twitterController.js';
import { handleReddit } from './controllers/redditController.js';
import { handleLinkedIn } from './controllers/linkedinController.js';
import { handleChatGPT } from './controllers/chatgptController.js';

/**
 * Sends a message to the background script to save a bookmark.
 * @param {string} platform - The platform identifier (e.g., 'x', 'reddit').
 * @param {string} url - The URL to bookmark.
 */
function sendMessageToBackground(platform, url) {
    console.log(`[WTHAI:ContentScript] Sending message: ${platform} - ${url}`);
    // Check if the runtime API is available
    if (typeof chrome === "undefined" || !chrome.runtime || !chrome.runtime.sendMessage) {
        console.error("[WTHAI:ContentScript] chrome.runtime.sendMessage is not available. Check execution context.");
        return; // Exit if the API isn't available
    }
    chrome.runtime.sendMessage({
        action: "saveBookmark",
        platform: platform,
        url: url
    })
    .then(response => {
        console.log(`[WTHAI:ContentScript] Background response:`, response);
    })
    .catch(error => {
        // Improved error logging
        let errorMessage = error.message || "Unknown error";
        console.error(`[WTHAI:ContentScript] Error sending message: ${errorMessage}`, error);
        if (errorMessage.includes("Receiving end does not exist")) {
            console.warn("[WTHAI:ContentScript] Suggestion: Background service worker might be inactive. Ensure it wakes up properly.");
        }
        // Consider adding more specific error handling or user feedback
    });
}

// --- Removed Twitter/X Specific Logic --- 

// --- Removed Reddit Specific Logic --- 

// --- Removed LinkedIn Specific Logic --- 

// --- Removed ChatGPT Specific Logic ---

// --- Main Execution Logic --- 
/**
 * Initializes the content script by identifying the current platform
 * and attaching the appropriate event handlers.
 */
function initialize() {
    const hostname = window.location.hostname;
    console.log(`[WTHAI:ContentScript] Initializing for hostname: ${hostname}`);

    // Pass the sendMessage function to the appropriate handler
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
        console.log("[WTHAI:ContentScript] Initializing Twitter/X handler.");
        handleTwitter(sendMessageToBackground);
    } else if (hostname.includes('reddit.com')) {
        console.log("[WTHAI:ContentScript] Initializing Reddit handler.");
        // Delay slightly allows Reddit's JS to build the initial DOM elements
        // Adjust timeout if buttons don't appear reliably on first load
        setTimeout(() => handleReddit(sendMessageToBackground), 500);
    } else if (hostname.includes('linkedin.com')) {
        console.log("[WTHAI:ContentScript] Initializing LinkedIn handler.");
        // LinkedIn might also benefit from a slight delay
        setTimeout(() => handleLinkedIn(sendMessageToBackground), 500);
    } else if (hostname.includes('chatgpt.com')) {
        console.log("[WTHAI:ContentScript] Initializing ChatGPT handler.");
        // ChatGPT also needs observation, start immediately or with slight delay
        setTimeout(() => handleChatGPT(sendMessageToBackground), 500);
    } else {
        console.log("[WTHAI:ContentScript] Script active on unrecognized page:", hostname);
    }
}

// Run initialize function once the DOM is ready
if (document.readyState === 'loading') {
    console.log("[WTHAI:ContentScript] DOM not ready, adding listener.");
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    console.log("[WTHAI:ContentScript] DOM ready, initializing immediately.");
    initialize();
} 