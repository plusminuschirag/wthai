console.log("[WTHAI:ChatGPTController] Loaded.");

/**
 * Handles ChatGPT page interactions, specifically observing the share dialog
 * to inject a Swooosh button.
 * @param {function(string, string): void} sendMessage - Function to send messages to the background script.
 */
export function handleChatGPT(sendMessage) {
    console.log("[WTHAI:ChatGPT] Initializing handler.");

    // Debounce function to prevent rapid firing of observer callbacks
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // --- Main Logic for Handling Share Dialog --- 
    const processShareDialog = (dialogElement) => {
        console.log("[WTHAI:ChatGPT] Processing potential share dialog:", dialogElement);

        // --- Stage 1: Look for "Update link" button (or initial state) --- 
        const updateButtonSelector = 'button.btn-primary'; // Might need adjustment
        const potentialUpdateButtons = dialogElement.querySelectorAll(updateButtonSelector);
        let updateButton = null;

        potentialUpdateButtons.forEach(btn => {
            if (btn.textContent?.includes('Update link')) {
                updateButton = btn;
            }
        });

        if (updateButton && !updateButton.dataset.wthaiListenerAttached) {
            console.log("[WTHAI:ChatGPT] 'Update link' button found. Attaching click listener.");
            updateButton.dataset.wthaiListenerAttached = 'true'; // Mark as attached

            updateButton.addEventListener('click', () => {
                console.log("[WTHAI:ChatGPT] 'Update link' button clicked. Scheduling check for share elements...");

                // Wait *after* the click for the dialog content to potentially update
                setTimeout(() => {
                    console.log("[WTHAI:ChatGPT] Checking for share elements after update click delay.");
                    // Re-query for the *current* dialog, as it might have been replaced
                    const currentDialog = document.querySelector('div[role="dialog"][data-state="open"]'); 
                    if (currentDialog) {
                         console.log("[WTHAI:ChatGPT] Re-acquired dialog after update click:", currentDialog);
                        injectSwoooshIfReady(currentDialog);
                    } else {
                        console.warn("[WTHAI:ChatGPT] Dialog disappeared after 'Update link' click delay.");
                    }
                }, 3000); // Delay after click (adjust if needed)
            }, { once: true }); // Ensure listener fires only once

        } else if (updateButton && updateButton.dataset.wthaiListenerAttached) {
             console.log("[WTHAI:ChatGPT] 'Update link' button found, but listener already attached.");
        } else {
            // --- Stage 2: If no "Update link", check for final share state immediately --- 
            console.log("[WTHAI:ChatGPT] 'Update link' button not found or already handled. Checking for final share state.");
            injectSwoooshIfReady(dialogElement);
        }
    };

    // --- Function to Inject Swooosh Button --- 
    const injectSwoooshIfReady = (dialogElement) => {
        const buttonContainerSelector = 'div.mt-6.flex.justify-center.space-x-14'; // Specific to ChatGPT UI
        const socialShareContainer = dialogElement.querySelector(buttonContainerSelector);
        const urlInput = dialogElement.querySelector('input[type="text"][value^="https://chatgpt.com/share/"]:not([disabled])');
        const uniqueButtonClass = 'wthai-swooosh-chatgpt-button'; // For preventing duplicates

        console.log("[WTHAI:ChatGPT] Checking injection conditions:", { socialShareContainer, urlInput });

        if (socialShareContainer && urlInput && !socialShareContainer.querySelector(`.${uniqueButtonClass}`)) {
            const shareUrl = urlInput.value;
            if (shareUrl) {
                console.log("[WTHAI:ChatGPT] Found Share Container and URL Input. Injecting Swooosh button for URL:", shareUrl);

                const swoooshContainer = document.createElement('div');
                swoooshContainer.className = `flex flex-col items-center ${uniqueButtonClass}`;

                const swoooshButton = document.createElement('button');
                swoooshButton.textContent = 'Swooosh';
                // Apply styles consistent with other share buttons
                swoooshButton.style.padding = '8px 12px';
                swoooshButton.style.border = '1px solid #ccc';
                swoooshButton.style.borderRadius = '20px'; // Match round style
                swoooshButton.style.cursor = 'pointer';
                swoooshButton.style.backgroundColor = 'var(--main-surface-secondary)'; // Try to use CSS var
                swoooshButton.style.marginBottom = '4px'; // Space before text

                const swoooshText = document.createElement('span');
                swoooshText.className = 'text-token-text-secondary mt-1 text-xs font-semibold'; // Match text style
                swoooshText.textContent = 'Swooosh';

                swoooshContainer.appendChild(swoooshButton);
                swoooshContainer.appendChild(swoooshText);
                socialShareContainer.appendChild(swoooshContainer);
                console.log("[WTHAI:ChatGPT] Swooosh button injected into:", socialShareContainer);

                swoooshButton.addEventListener('click', (event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    console.log("[WTHAI:ChatGPT] Swooosh button clicked for URL:", shareUrl);
                    sendMessage('chatgpt', shareUrl);

                    // Visual feedback
                    swoooshButton.textContent = 'Swoooshed!';
                    swoooshButton.disabled = true;
                    swoooshButton.style.cursor = 'default';
                    swoooshButton.style.opacity = '0.6';
                    swoooshText.textContent = 'Swoooshed!';
                });
            } else {
                console.warn("[WTHAI:ChatGPT] Found URL input but failed to get value.");
            }
        } else {
            if (!socialShareContainer) console.log("[WTHAI:ChatGPT] Did not find social share container.");
            if (!urlInput) console.log("[WTHAI:ChatGPT] Did not find URL input.");
            if (socialShareContainer && socialShareContainer.querySelector(`.${uniqueButtonClass}`)) console.log("[WTHAI:ChatGPT] Swooosh button already injected.");
        }
    };

    // --- Mutation Observer Setup --- 
    // Debounced version of the handler to avoid excessive processing during rapid DOM changes
    const debouncedObserverHandler = debounce((mutationsList) => {
         console.log("[WTHAI:ChatGPT] Debounced MutationObserver callback triggered.");
         let dialogFound = false;
        for (const mutation of mutationsList) {
            // Look for added dialogs or changes to data-state
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                         // Check if the added node is the dialog or contains it
                        const dialogSelector = 'div[role="dialog"][data-state="open"]'; // More specific might be needed
                        let dialogElement = null;
                        if (node.matches && node.matches(dialogSelector)) {
                            dialogElement = node;
                        } else if (node.querySelector) {
                            dialogElement = node.querySelector(dialogSelector);
                        }

                        if (dialogElement) {
                            console.log("[WTHAI:ChatGPT] Dialog node added or found within added node:", dialogElement);
                            // Use requestAnimationFrame to ensure the dialog is fully rendered
                            requestAnimationFrame(() => processShareDialog(dialogElement));
                            dialogFound = true;
                            return; // Process the first found dialog in this batch
                        }
                    }
                });
            } else if (mutation.type === 'attributes' && mutation.attributeName === 'data-state') {
                const target = mutation.target;
                if (target.matches && target.matches('div[role="dialog"][data-state="open"]')) {
                     console.log("[WTHAI:ChatGPT] Dialog data-state changed to open:", target);
                     requestAnimationFrame(() => processShareDialog(target));
                     dialogFound = true;
                      return; // Process this state change
                }
            }
            if (dialogFound) break; // Exit loop if dialog processed
        }
    }, 500); // Debounce wait time in ms (adjust as needed)

    const observer = new MutationObserver(debouncedObserverHandler);

    // Start observing the body for dialog additions/changes
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-state'] // Observe changes to data-state specifically
    });
    console.log("[WTHAI:ChatGPT] MutationObserver started.");
} 