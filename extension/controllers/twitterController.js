console.log("[WTHAI:TwitterController] Loaded.");

/**
 * Attaches event listeners to handle bookmarking actions on Twitter/X.
 * @param {function(string, string): void} sendMessage - Function to send messages to the background script.
 */
export function handleTwitter(sendMessage) {
    console.log("Handling Twitter/X page");
    // Use event delegation on the body for the native bookmark button
    document.body.addEventListener('click', (event) => {
        // Use a more specific selector if possible, but data-testid is common in React apps
        const bookmarkButton = event.target.closest('button[data-testid="bookmark"]');
        if (bookmarkButton) {
            console.log("X Bookmark button clicked (native)");
            // Find the closest tweet article container
            const tweetArticle = bookmarkButton.closest('article[data-testid="tweet"]');
            if (tweetArticle) {
                // Find the permalink element within the article
                // Twitter structure changes, this selector might need adjustment
                const timeLink = tweetArticle.querySelector('a[href*="/status/"] time');
                if (timeLink) {
                    const statusLinkElement = timeLink.closest('a');
                    if (statusLinkElement && statusLinkElement.href) {
                        const tweetUrl = statusLinkElement.href;
                        console.log("[WTHAI:Twitter] Sending bookmark for:", tweetUrl);
                        sendMessage('x', tweetUrl); // Send with platform 'x'
                    } else {
                        console.warn("[WTHAI:Twitter] Could not find parent link element for timestamp.");
                    }
                } else {
                    console.warn("[WTHAI:Twitter] Could not find timestamp link within the tweet article.");
                }
            } else {
                console.warn("[WTHAI:Twitter] Could not find parent tweet article for the bookmark button.");
            }
        }
    }, true); // Use capture phase to potentially catch the event earlier
} 