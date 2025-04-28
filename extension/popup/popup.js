const signInButton = document.getElementById('signInButton');
const signOutButton = document.getElementById('signOutButton');
const userInfoDiv = document.getElementById('userInfo');
const userEmailSpan = document.getElementById('userEmail');
const userNameSpan = document.getElementById('userName');
const userPicture = document.getElementById('userPicture');
const signInSectionDiv = document.getElementById('signInSection');
const statusDiv = document.getElementById('status');

// Add IDs for metric elements
const metricsSectionDiv = document.getElementById('metricsSection');
const xCountSpan = document.getElementById('xCount');
const redditCountSpan = document.getElementById('redditCount');
const linkedinCountSpan = document.getElementById('linkedinCount');
const chatgptCountSpan = document.getElementById('chatgptCount');

const BACKEND_URL = 'https://server-42463408610.us-central1.run.app';
const BACKEND_USER_URL = `${BACKEND_URL}/user`;

// Helper functions for chrome.storage.local
const storage = chrome.storage.local;

async function getStoredAuth() {
    return new Promise((resolve) => {
        storage.get(['authToken', 'userInfo'], (result) => {
            resolve({ token: result.authToken, userInfo: result.userInfo });
        });
    });
}

async function setStoredAuth(token, userInfo) {
    return new Promise((resolve) => {
        storage.set({ authToken: token, userInfo: userInfo }, resolve);
    });
}

async function clearStoredAuth() {
    return new Promise((resolve) => {
        storage.remove(['authToken', 'userInfo'], resolve);
    });
}

function updateUI(signedIn, info = null) {
    if (signedIn && info) {
        signInSectionDiv.style.display = 'none';
        userInfoDiv.style.display = 'block';
        userNameSpan.textContent = info.name || 'N/A';
        userEmailSpan.textContent = info.email || 'N/A';
        if (info.picture) {
            userPicture.src = info.picture;
            userPicture.style.display = 'inline-block';
        } else {
            userPicture.style.display = 'none';
        }

        // Update metrics display
        if (info.metrics && metricsSectionDiv) {
            xCountSpan.textContent = info.metrics.x?.toString() || '0';
            redditCountSpan.textContent = info.metrics.reddit?.toString() || '0';
            linkedinCountSpan.textContent = info.metrics.linkedin?.toString() || '0';
            chatgptCountSpan.textContent = info.metrics.chatgpt?.toString() || '0';
            metricsSectionDiv.style.display = 'block'; // Ensure section is visible
        } else if (metricsSectionDiv) {
            xCountSpan.textContent = '0';
            redditCountSpan.textContent = '0';
            linkedinCountSpan.textContent = '0';
            chatgptCountSpan.textContent = '0';
            metricsSectionDiv.style.display = 'block'; // Keep section visible but with 0s
        }

        statusDiv.textContent = '';
    } else {
        signInSectionDiv.style.display = 'block';
        userInfoDiv.style.display = 'none';
        userNameSpan.textContent = '';
        userEmailSpan.textContent = '';
        userPicture.style.display = 'none';
        userPicture.src = '';

         // Reset metrics display on sign out
        if (metricsSectionDiv) {
             xCountSpan.textContent = '0';
             redditCountSpan.textContent = '0';
             linkedinCountSpan.textContent = '0';
             chatgptCountSpan.textContent = '0';
             metricsSectionDiv.style.display = 'none'; // Hide section when signed out
        }
    }
}

function showStatus(message, isError = false) {
    console.log(message);
    statusDiv.textContent = message;
    statusDiv.style.color = isError ? 'red' : 'green';
}

async function fetchUserInfo(token) {
    showStatus('Fetching user info from Google...', false);
    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            if (response.status === 401) {
                chrome.identity.removeCachedAuthToken({ token: token }, () => {
                    console.log("Removed potentially invalid token.");
                });
            }
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        if (!data.id) {
            throw new Error("User ID not found in Google API response.");
        }
        console.log("User Info from Google:", data);
        return {
            id: data.id,
            email: data.email,
            name: data.name || data.given_name,
            picture: data.picture
        };
    } catch (error) {
        showStatus(`Error fetching user info: ${error.message}`, true);
        return null;
    }
}

async function syncUserWithBackend(userInfo) {
    if (!userInfo || !userInfo.id) {
        console.error("Cannot sync with backend: Invalid user info provided.");
        return false;
    }
    showStatus('Syncing user data with backend...', false);
    try {
        const response = await fetch(BACKEND_USER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userInfo.id,
                name: userInfo.name,
                email: userInfo.email,
                picture: userInfo.picture
            }),
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(`Backend sync failed: ${response.status} ${response.statusText} - ${responseData.error || responseData.message || ''}`);
        }

        console.log('Backend sync successful:', responseData.message);
        showStatus('User data synced with backend.', false);
        // Return the user object which now includes metrics
        return responseData.user;
    } catch (error) {
        showStatus(`Error syncing with backend: ${error.message}`, true);
        console.error('Backend sync error details:', error);
        // Return null or indicate failure, but don't return partial user info
        return null;
    }
}

signInButton.addEventListener('click', () => {
    showStatus('Attempting sign in...');
    // Directly call getAuthToken to initiate the interactive sign-in flow
    chrome.identity.getAuthToken({ interactive: true }, async (token) => {
        if (chrome.runtime.lastError) {
            showStatus(`Sign in failed: ${chrome.runtime.lastError.message}`, true);
            updateUI(false);
            await clearStoredAuth(); // Clear storage on failure
            return;
        }
        if (!token) {
            showStatus('Sign in failed: No token received.', true);
            updateUI(false);
            await clearStoredAuth(); // Clear storage on failure
            return;
        }

        // Token received, now proceed with fetching info and syncing
        const googleUserInfo = await fetchUserInfo(token);

        if (googleUserInfo) {
            const backendUserInfo = await syncUserWithBackend(googleUserInfo);
            if (backendUserInfo) {
                // Store the newly obtained token and backend user info
                await setStoredAuth(token, backendUserInfo);
                updateUI(true, backendUserInfo);
                showStatus('Successfully signed in and synced!', false);
            } else {
                // Sync failed: Clear storage, update UI temporarily, show error
                await clearStoredAuth();
                const tempUserInfo = { ...googleUserInfo, metrics: { x: 0, reddit: 0, linkedin: 0, chatgpt: 0 } };
                updateUI(true, tempUserInfo); // Show Google info with 0 metrics
                showStatus('Signed in, but failed to sync data with backend. Please try again.', true);
                // Remove the potentially problematic token from cache
                chrome.identity.removeCachedAuthToken({ token: token }, () => {
                    console.log("Removed cached token after backend sync failure.");
                });
            }
        } else {
            // Failed to get Google user info with the token
            showStatus('Sign in succeeded, but failed to get user info from Google.', true);
            await clearStoredAuth(); // Clear storage
            // Remove the invalid token from cache
            chrome.identity.removeCachedAuthToken({ token: token }, () => {
                console.log("Removed cached token after failing to fetch Google user info.");
                updateUI(false);
            });
        }
    });
});

signOutButton.addEventListener('click', async () => {
    showStatus('Signing out...', false);
    const { token: storedToken } = await getStoredAuth();

    if (storedToken) {
        try {
            // 1. Revoke Google token (best effort)
            try {
                 await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${storedToken}`);
                 console.log("Attempted token revocation from Google.");
            } catch (revokeError) {
                 console.warn("Error during token revocation:", revokeError);
            }

            // 2. Remove cached token from Chrome Identity
            await new Promise((resolve, reject) => {
                 chrome.identity.removeCachedAuthToken({ token: storedToken }, () => {
                     if (chrome.runtime.lastError) {
                         // Log error but continue sign-out process
                         console.warn(`Error removing cached token: ${chrome.runtime.lastError.message}`);
                     } else {
                         console.log("Removed cached auth token.");
                     }
                     resolve(); // Always resolve to continue sign out
                 });
            });

            // 3. Clear stored token and user info
            await clearStoredAuth();

            // 4. Update UI and show status
            updateUI(false);
            showStatus('Signed out successfully.', false);

        } catch (error) {
             // Catch any unexpected error during the sign-out steps
             console.error("Unexpected error during sign out:", error);
             showStatus(`Sign out failed: ${error.message}`, true);
             // Attempt to clear storage and update UI even on error
             await clearStoredAuth();
             updateUI(false);
        }
    } else {
        // If no token was stored, just ensure UI is logged out
        showStatus('Already signed out.', false);
        await clearStoredAuth(); // Ensure storage is clear
        updateUI(false);
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    showStatus('Checking sign-in status...');
    const { token: storedToken, userInfo: storedUserInfo } = await getStoredAuth();

    if (storedToken && storedUserInfo) {
        console.log("Found stored token and user info. Updating UI.");
        updateUI(true, storedUserInfo);
        showStatus('Signed in.', false);

        // Optional: Verify token validity silently in the background
        // This adds complexity but ensures the token hasn't expired
        // You could add a function verifyToken(storedToken) here
        // that calls getAuthToken({interactive: false}) and handles
        // potential errors (e.g., clearing storage if token invalid).
        // For now, we'll assume the stored token is valid until an
        // operation fails or the user signs out.

    } else {
        console.log("No stored token/info or incomplete data. User needs to sign in.");
        showStatus('Please sign in.', false);
        updateUI(false);
        // Optional: Attempt a silent sign-in if no token is found?
        // chrome.identity.getAuthToken({ interactive: false }, async (token) => { ... });
        // This might automatically log them back in if they are signed into Chrome
        // and have previously granted permissions, but could be confusing.
        // Let's stick to requiring manual sign-in for now.
    }

    /* // Remove old logic based on getAuthToken on load
    chrome.identity.getAuthToken({ interactive: false }, async (token) => {
        if (chrome.runtime.lastError || !token) {
// ... existing code ...
        }
    });
    */
}); // Make the listener async 