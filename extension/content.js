// content.js
console.log("Bookmark Content Script Loaded");

// Use event delegation on the body to catch clicks on dynamically loaded elements
document.body.addEventListener('click', async (event) => {
    const bookmarkButton = event.target.closest('button[data-testid="bookmark"]');

    if (bookmarkButton) {
        console.log("Bookmark button clicked");

        // Find the closest parent article element which represents the tweet
        const tweetArticle = bookmarkButton.closest('article[data-testid="tweet"]');

        if (tweetArticle) {
            // Find the timestamp link within the article
            // Twitter uses links with a specific structure: /<username>/status/<tweet_id>
            // We look for an 'a' tag whose href matches this pattern and contains a 'time' element
            const timeLink = tweetArticle.querySelector('a[href*="/status/"] time');

            if (timeLink) {
                const statusLinkElement = timeLink.closest('a');
                if (statusLinkElement && statusLinkElement.href) {
                    const tweetUrl = statusLinkElement.href;
                    console.log("Found tweet URL:", tweetUrl);

                    // Send the URL to the background script
                    try {
                        const response = await chrome.runtime.sendMessage({ 
                            action: "saveBookmark", 
                            url: tweetUrl 
                        });
                        console.log("Background script response:", response);
                    } catch (error) {
                        console.error("Error sending message to background script:", error);
                        // Handle potential errors, e.g., if the background script isn't ready
                        if (error.message.includes("Receiving end does not exist")) {
                            console.warn("Background script might not be active. Retrying might be needed or check extension status.");
                        }
                    }
                } else {
                    console.log("Could not find the parent link element for the timestamp.");
                }
            } else {
                console.log("Could not find the timestamp link within the tweet article.");
            }
        } else {
            console.log("Could not find the parent tweet article for the bookmark button.");
        }
    }
}, true); // Use capture phase to potentially catch the event earlier 