console.log("[WTHAI:LinkedInController] Loaded.");

/**
 * Attaches event listeners to handle bookmarking actions on LinkedIn.
 * This implementation targets the click on the options menu button.
 * @param {function(string, string): void} sendMessage - Function to send messages to the background script.
 */
export function handleLinkedIn(sendMessage) {
    console.log("[WTHAI:LinkedIn] Initializing handler.");

    document.body.addEventListener('click', (event) => {
        // Target the three-dots menu button for a post
        const optionsButton = event.target.closest('button.feed-shared-control-menu__trigger');

        if (optionsButton) {
            console.log("[WTHAI:LinkedIn] Options button clicked.");

            // Find the closest ancestor element that contains the post URN or ID
            // LinkedIn's structure might change, so this selector needs verification.
            const postContainer = optionsButton.closest('[data-urn^="urn:li:activity:"],[data-urn^="urn:li:share:"],[data-id^="urn:li:activity:"],[data-id^="urn:li:share:"]');

            if (postContainer) {
                // Extract the URN or ID
                const postUrn = postContainer.getAttribute('data-urn') || postContainer.getAttribute('data-id');
                console.log("[WTHAI:LinkedIn] Extracted URN/ID:", postUrn);

                // Validate and construct the full post URL
                if (postUrn && (postUrn.startsWith('urn:li:share:') || postUrn.startsWith('urn:li:activity:'))) {
                    // Construct the canonical URL. LinkedIn might change this structure.
                    const postUrl = `https://www.linkedin.com/feed/update/${postUrn}/`;
                    console.log("[WTHAI:LinkedIn] Constructed Post URL:", postUrl);

                    // Send the message to the background script
                    // Adding a small delay might be helpful if the click triggers other UI changes,
                    // but typically not necessary just for extracting an attribute.
                    sendMessage('linkedin', postUrl);

                } else {
                    console.warn("[WTHAI:LinkedIn] Could not extract a valid URN/ID from container:", postContainer, "Found:", postUrn);
                }
            } else {
                console.warn("[WTHAI:LinkedIn] Could not find parent post container for the clicked options button:", optionsButton);
            }
        }
        // No log needed if the click wasn't the target button
    }, true); // Use capture phase
} 