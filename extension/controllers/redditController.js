console.log("[WTHAI:RedditController] Loaded.");

/**
 * Handles Reddit page interactions, injecting Swooosh buttons and managing dynamic content.
 * @param {function(string, string): void} sendMessage - Function to send messages to the background script.
 */
export function handleReddit(sendMessage) {
    console.log("Handling Reddit page - Injecting 'Swooosh' button");

    /**
     * Injects a Swooosh button into a Reddit post element.
     * @param {HTMLElement} postElement - The shreddit-post custom element.
     */
    function injectSwoooshButton(postElement) {
        // Access the Shadow DOM
        const shadowRoot = postElement.shadowRoot;

        if (!shadowRoot) {
            console.warn("[WTHAI:Reddit] ShadowRoot not found for post element. Cannot inject button.", postElement);
            return; // Can't proceed without shadowRoot
        }

        // Check if button already injected within this shadowRoot
        if (shadowRoot.querySelector('.wthai-swooosh-button')) {
            // console.log("[WTHAI:Reddit] Button already injected in:", postElement);
            return; // Already injected
        }

        // Find the button bar container *inside* the shadowRoot
        // This selector needs to be robust against Reddit UI changes.
        // Inspect Reddit's DOM structure for the most stable selector.
        const buttonBarSelectors = [
            'div.shreddit-post-actionBar', // Potential new selector
            'div.buttons', // Old Reddit style
            'footer' // Sometimes actions are in a footer
            // Add more potential selectors based on inspection
        ];

        let buttonBar = null;
        for (const selector of buttonBarSelectors) {
            buttonBar = shadowRoot.querySelector(selector);
            if (buttonBar) {
                console.log(`[WTHAI:Reddit] Found button bar in shadowRoot using selector: ${selector}`);
                break;
            }
        }

        if (!buttonBar) {
            console.warn("[WTHAI:Reddit] Could not find a suitable button bar container inside shadowRoot for:", postElement);
            return; // Cannot find a place to inject
        }

        const swoooshButton = document.createElement('button');
        swoooshButton.textContent = 'Swooosh';
        swoooshButton.className = 'wthai-swooosh-button'; // Class for identification
        // Basic styling - consider external CSS for better management
        swoooshButton.style.marginLeft = '8px';
        swoooshButton.style.padding = '4px 8px';
        swoooshButton.style.border = '1px solid #ccc';
        swoooshButton.style.borderRadius = '4px';
        swoooshButton.style.cursor = 'pointer';
        swoooshButton.style.fontSize = '12px';
        swoooshButton.style.lineHeight = '16px';
        swoooshButton.style.fontWeight = 'bold';
        swoooshButton.style.color = 'var(--button-color, #0079d3)'; // Try to use Reddit's variable
        swoooshButton.style.backgroundColor = 'var(--button-background-color, transparent)';

        buttonBar.appendChild(swoooshButton);
        console.log("[WTHAI:Reddit] Swooosh button appended to:", buttonBar);

        swoooshButton.addEventListener('click', (event) => {
            console.log("[WTHAI:Reddit] Swooosh button clicked! Event Target:", event.target);
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            // Extract permalink directly from the shreddit-post element's attribute
            let postUrl = postElement.getAttribute('permalink');
            console.log("[WTHAI:Reddit] URL from getAttribute('permalink'):", postUrl);

            // Fallback if getAttribute fails
            if (!postUrl) {
                console.warn("[WTHAI:Reddit] getAttribute('permalink') failed. Attempting fallback URL extraction...");
                const linkElement = shadowRoot.querySelector(
                   'a[slot="full-post-link"], a[data-testid="post-title"], a.title, a[data-click-id="comments"]'
                );
                 console.log("[WTHAI:Reddit] Fallback linkElement found:", linkElement);
                 if(linkElement) postUrl = linkElement.href;
             }

             // Ensure absolute URL if it starts with '/'
             if (postUrl && postUrl.startsWith('/')) {
                postUrl = `https://www.reddit.com${postUrl}`;
             }

             // Clean up URL (remove query params/hashes)
             if (postUrl) {
                 console.log("[WTHAI:Reddit] URL before cleaning:", postUrl);
                 try {
                     const urlObj = new URL(postUrl);
                     postUrl = urlObj.origin + urlObj.pathname;
                 } catch (e) {
                     console.error("[WTHAI:Reddit] Error parsing potential URL:", postUrl, e);
                     postUrl = null;
                 }
                 console.log("[WTHAI:Reddit] URL after cleaning:", postUrl);
             }

            if (postUrl) {
                console.log("[WTHAI:Reddit] Sending bookmark for URL:", postUrl);
                sendMessage('reddit', postUrl);
                // Visual Feedback
                swoooshButton.textContent = 'Swoooshed!';
                swoooshButton.disabled = true;
                swoooshButton.style.cursor = 'default';
                swoooshButton.style.backgroundColor = '#e8e8e8'; // Example: grey out
                swoooshButton.style.color = '#555';
            } else {
                console.error("[WTHAI:Reddit] Could not extract post URL for:", postElement);
                swoooshButton.textContent = 'Error!'; // Basic error feedback
            }
        });
    }

    /**
     * Finds and processes all relevant posts currently on the page or within a node.
     * @param {Node} [targetNode=document] - The node to search within.
     */
    function processPosts(targetNode = document) {
        const postSelector = 'shreddit-post'; // Target the custom element directly
        let posts = [];
        // Check if the targetNode itself is a post
        if (targetNode.matches && targetNode.matches(postSelector)) {
            posts = [targetNode];
        }
        // Find posts within the targetNode, checking for existence of querySelectorAll
        if (targetNode.querySelectorAll) {
           posts = posts.concat(Array.from(targetNode.querySelectorAll(postSelector)));
        }

        if (posts.length > 0) {
            // console.log(`[WTHAI:Reddit] Processing ${posts.length} post(s) found within:`, targetNode);
            posts.forEach(post => injectSwoooshButton(post));
        } else {
            // console.log("[WTHAI:Reddit] No new shreddit-post elements found in:", targetNode);
        }
    }

    // Initial run to inject buttons into already loaded posts
    console.log("[WTHAI:Reddit] Initial post processing run.");
    processPosts();

    // Use MutationObserver to handle dynamically loaded posts (infinite scroll)
    const observer = new MutationObserver((mutationsList) => {
        let processed = false;
        for (const mutation of mutationsList) {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    // Check if the added node is an element node (not text, etc.)
                    if (node.nodeType === Node.ELEMENT_NODE) {
                         // Check if the added node itself is a post or contains posts
                         // Defer processing slightly to allow element rendering
                         requestAnimationFrame(() => processPosts(node));
                         processed = true;
                    }
                });
            }
        }
        // if (processed) console.log("[WTHAI:Reddit] MutationObserver processed added nodes.");
    });

    // Observe the body or a more specific feed container if possible.
    const feedContainer = document.querySelector('#main-content') || document.body;
    observer.observe(feedContainer, { childList: true, subtree: true });
    console.log("[WTHAI:Reddit] MutationObserver started observing:", feedContainer);
} 