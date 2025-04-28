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
                let tweetContent = null;
                let tweetAssets = [];

                // --- Extract tweet text --- 
                const tweetTextElement = tweetArticle.querySelector('[data-testid="tweetText"]');
                if (tweetTextElement && tweetTextElement.textContent) {
                    tweetContent = tweetTextElement.textContent.trim();
                    console.log("[WTHAI:Twitter] Tweet Text:", tweetContent);
                } else {
                    console.warn("[WTHAI:Twitter] Could not find tweet text element or text content.");
                }

                // --- Extract asset URLs --- 
                const images = tweetArticle.querySelectorAll('img[src*="/media/"]');
                images.forEach((img, index) => {
                    if (img.src) {
                        tweetAssets.push(img.src);
                        console.log(`[WTHAI:Twitter] Image URL ${index + 1}:`, img.src);
                    }
                });

                const videos = tweetArticle.querySelectorAll('video[src]');
                videos.forEach((video, index) => {
                    if (video.src) {
                        // Sometimes video src might be a blob, try poster if available
                        const videoSrc = video.src.startsWith('blob:') ? video.poster : video.src;
                        if (videoSrc) {
                             tweetAssets.push(videoSrc);
                             console.log(`[WTHAI:Twitter] Video URL ${index + 1}:`, videoSrc);
                        }
                    }
                });

                // Find the permalink element within the article
                // Twitter structure changes, this selector might need adjustment
                const timeLink = tweetArticle.querySelector('a[href*="/status/"] time');
                if (timeLink) {
                    const statusLinkElement = timeLink.closest('a');
                    if (statusLinkElement && statusLinkElement.href) {
                        const tweetUrl = statusLinkElement.href;
                        console.log("[WTHAI:Twitter] Sending bookmark for:", tweetUrl, "Content:", tweetContent, "Assets:", tweetAssets);
                        // Pass content and assets to sendMessage
                        sendMessage('x', tweetUrl, tweetContent, tweetAssets); 
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