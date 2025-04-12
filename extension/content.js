// content.js
console.log("Content Script Loaded - WhoTheHellAmI");

function sendMessageToBackground(platform, url) {
    console.log(`Sending ${platform} URL to background:`, url);
    chrome.runtime.sendMessage({
        action: "saveBookmark",
        platform: platform,
        url: url
    })
    .then(response => {
        console.log("Background script response:", response);
        // Visual feedback is handled in the button click listener now
    })
    .catch(error => {
        console.error("Error sending message to background script:", error);
        if (error.message.includes("Receiving end does not exist")) {
            console.warn("Background script might not be active.");
        }
        // TODO: Add error feedback to the button?
    });
}

// --- Twitter/X Specific Logic ---
function handleTwitter() {
    console.log("Handling Twitter/X page");
    // Use event delegation on the body for the native bookmark button
    document.body.addEventListener('click', (event) => {
        const bookmarkButton = event.target.closest('button[data-testid="bookmark"]');
        if (bookmarkButton) {
            console.log("X Bookmark button clicked (native)");
            const tweetArticle = bookmarkButton.closest('article[data-testid="tweet"]');
            if (tweetArticle) {
                const timeLink = tweetArticle.querySelector('a[href*="/status/"] time');
                if (timeLink) {
                    const statusLinkElement = timeLink.closest('a');
                    if (statusLinkElement && statusLinkElement.href) {
                        const tweetUrl = statusLinkElement.href;
                        sendMessageToBackground('x', tweetUrl); // Send with platform 'x'
                    } else { console.log("X: Could not find parent link element for timestamp."); }
                } else { console.log("X: Could not find timestamp link."); }
            } else { console.log("X: Could not find parent tweet article."); }
        }
    }, true); // Use capture phase
}

// --- Reddit Specific Logic ---
function handleReddit() {
    console.log("Handling Reddit page - Injecting 'Swooosh' button");

    // Function to inject the button into a Reddit post element
    function injectSwoooshButton(postElement) {
        // Access the Shadow DOM
        const shadowRoot = postElement.shadowRoot;

        // --- DEBUG ---
        console.log("[WTHAI Debug] Trying to find button bar inside shadowRoot of:", postElement, "ShadowRoot found:", !!shadowRoot);

        if (!shadowRoot) {
            console.warn("[WTHAI] ShadowRoot not found for post element. Cannot inject button.", postElement);
            return; // Can't proceed without shadowRoot
        }

        // Check if button already injected within this shadowRoot
        if (shadowRoot.querySelector('.wthai-swooosh-button')) {
            return; // Already injected
        }
        
        // Find the button bar container *inside* the shadowRoot
        let buttonBar = null;
        const buttonBarSelector = 'div.shreddit-post-container'; // Class from screenshot
        buttonBar = shadowRoot.querySelector(buttonBarSelector);

        // --- DEBUG ---
        console.log(`[WTHAI Debug] Found buttonBar inside shadowRoot using selector "${buttonBarSelector}":`, buttonBar);

        if (!buttonBar) {
            console.warn("[WTHAI] Reddit: Could not find button bar using selector 'div.shreddit-post-container' inside shadowRoot. Skipping button injection.", postElement);
            return; // Cannot find a suitable place to inject
        }

        const swoooshButton = document.createElement('button');
        swoooshButton.textContent = 'Swooosh';
        swoooshButton.className = 'wthai-swooosh-button'; // Class for identification
        // Basic styling - mimic Reddit's style if possible
        swoooshButton.style.marginLeft = '8px'; 
        swoooshButton.style.padding = '4px 8px';
        swoooshButton.style.border = '1px solid #ccc';
        swoooshButton.style.borderRadius = '4px';
        swoooshButton.style.cursor = 'pointer';
        swoooshButton.style.fontSize = '12px';
        swoooshButton.style.lineHeight = '16px';
        swoooshButton.style.fontWeight = 'bold';

        buttonBar.appendChild(swoooshButton);

        swoooshButton.addEventListener('click', (event) => {
            // --- DEBUG ---
            console.log("[WTHAI Debug] Swooosh button clicked! Event:", event);
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            // --- DEBUG ---
            console.log("[WTHAI Debug] preventDefault, stopPropagation AND stopImmediatePropagation called.");

            // Extract permalink directly from the shreddit-post element's attribute
            let postUrl = postElement.getAttribute('permalink'); 
            // --- DEBUG ---
            console.log("[WTHAI Debug] URL from getAttribute('permalink'):", postUrl);

            // Fallback if getAttribute fails (though it shouldn't based on the log)
            if (!postUrl) {
                // --- DEBUG ---
                console.log("[WTHAI Debug] getAttribute('permalink') failed. Attempting URL extraction via querySelector...");
                 const linkElement = postElement.querySelector(
                    'a[data-click-id="body"], '+ // Main post link
                    'a[data-testid="post-title"], '+ // Title link
                    'a.title, '+ // Old reddit title
                    'a[data-click-id="comments"], '+ // Comments link often holds permalink
                    'a.bylink[data-event-action="comments"], '+ // Another comments link pattern
                    'a.comments' // Yet another
                 );
                 // --- DEBUG ---
                 console.log("[WTHAI Debug] Found linkElement for URL extraction:", linkElement);
                 if(linkElement) postUrl = linkElement.href;
             }

             // Ensure absolute URL if it starts with '/'
             if (postUrl && postUrl.startsWith('/')) {
                postUrl = `https://www.reddit.com${postUrl}`;
             }

             // Clean up URL (remove query params/hashes)
             if (postUrl) {
                 // --- DEBUG ---
                 console.log("[WTHAI Debug] URL before cleaning:", postUrl);
                 try {
                     const urlObj = new URL(postUrl);
                     postUrl = urlObj.origin + urlObj.pathname;
                 } catch (e) {
                     console.error("[WTHAI] Error parsing potential URL:", postUrl, e);
                     postUrl = null;
                 }
                 // --- DEBUG ---
                 console.log("[WTHAI Debug] URL after cleaning:", postUrl);
             }

            if (postUrl) {
                console.log("[WTHAI] Swooosh button clicked for URL:", postUrl);
                // --- DEBUG ---
                console.log("[WTHAI Debug] Attempting to send message to background...");
                sendMessageToBackground('reddit', postUrl);
                // Visual Feedback
                swoooshButton.textContent = 'Swoooshed!';
                swoooshButton.disabled = true;
                swoooshButton.style.cursor = 'default';
                swoooshButton.style.backgroundColor = '#e8e8e8'; // Example: grey out
                swoooshButton.style.color = '#555';
            } else {
                console.error("[WTHAI] Reddit: Could not extract post URL for:", postElement);
                swoooshButton.textContent = 'Error!'; // Basic error feedback
            }
        });
    }

    // Function to find and process all relevant posts currently on the page
    function processPosts(targetNode = document) {
        const postSelectors = 'shreddit-post'; // Target the custom element directly
        // Need to handle cases where the targetNode itself is a post
        if (targetNode.matches && targetNode.matches(postSelectors)) {
            injectSwoooshButton(targetNode);
        }
        // Find posts within the targetNode
        const posts = targetNode.querySelectorAll(postSelectors);
        posts.forEach(post => injectSwoooshButton(post));
    }

    // Initial run to inject buttons into already loaded posts
    processPosts();

    // Use MutationObserver to handle dynamically loaded posts (infinite scroll)
    const observer = new MutationObserver((mutationsList) => {
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    // Check if the added node is an element node (not text, etc.)
                    if (node.nodeType === Node.ELEMENT_NODE) {
                         // Check if the added node itself is a post or contains posts
                         // Use requestAnimationFrame to defer processing slightly
                         requestAnimationFrame(() => processPosts(node));
                    }
                });
            }
        }
    });

    // Observe the body for changes. More specific container might be better if identifiable.
    const feedContainer = document.body;
    if (feedContainer) {
        observer.observe(feedContainer, { childList: true, subtree: true });
        // --- DEBUG ---
        // console.log("[WTHAI] MutationObserver started for Reddit posts.");
    } else {
        console.error("[WTHAI] Reddit: Could not find container to observe for dynamic posts.");
    }
}

// --- Main Execution Logic ---
function initialize() {
    const hostname = window.location.hostname;

    if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
        handleTwitter();
    } else if (hostname.includes('reddit.com')) {
        // Delay slightly allows Reddit's JS to build the initial DOM elements
        // Adjust timeout if buttons don't appear reliably on first load
        setTimeout(handleReddit, 500);
    } else {
        console.log("Content script active on unrecognized page:", hostname);
    }
}

// Run initialize function
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
} 