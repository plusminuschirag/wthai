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

let currentToken = null;
let currentUserInfo = null;

function updateUI(signedIn, info = null) {
    currentUserInfo = info;
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

        currentToken = null;
        currentUserInfo = null;
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
    chrome.identity.getAuthToken({ interactive: true }, async (token) => {
        if (chrome.runtime.lastError) {
            showStatus(`Sign in failed: ${chrome.runtime.lastError.message}`, true);
            updateUI(false);
            return;
        }
        if (!token) {
             showStatus('Sign in failed: No token received.', true);
             updateUI(false);
             return;
        }

        currentToken = token;
        const googleUserInfo = await fetchUserInfo(token);

        if (googleUserInfo) {
            // syncUserWithBackend now returns the full user object from backend
            const backendUserInfo = await syncUserWithBackend(googleUserInfo);
            if (backendUserInfo) {
                // Pass the full backend user info (including metrics) to updateUI
                updateUI(true, backendUserInfo); 
                showStatus('Successfully signed in and synced!', false);
            } else {
                // Still update UI with Google info, but show sync error and 0 metrics
                updateUI(true, { ...googleUserInfo, metrics: { x: 0, reddit: 0, linkedin: 0, chatgpt: 0 } }); 
                showStatus('Signed in, but failed to sync data with backend.', true);
            }
        } else {
             showStatus('Sign in succeeded, but failed to get user info.', true);
             chrome.identity.removeCachedAuthToken({ token: currentToken }, () => {
                updateUI(false);
                currentToken = null;
             });
        }
    });
});

signOutButton.addEventListener('click', () => {
    if (currentToken) {
        chrome.identity.removeCachedAuthToken({ token: currentToken }, () => {
            if (chrome.runtime.lastError) {
                showStatus(`Sign out failed: ${chrome.runtime.lastError.message}`, true);
            } else {
                showStatus('Signed out successfully.', false);
                updateUI(false);
                currentToken = null;
                if (currentToken) {
                    fetch(`https://accounts.google.com/o/oauth2/revoke?token=${currentToken}`)
                        .then(() => console.log("Token revoked from Google."))
                        .catch(err => console.error("Error revoking token:", err));
                }
            }
        });
    } else {
        showStatus('Already signed out.', false);
        updateUI(false);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    showStatus('Checking sign-in status...');
    chrome.identity.getAuthToken({ interactive: false }, async (token) => {
        if (chrome.runtime.lastError || !token) {
            showStatus('Please sign in.', false);
            updateUI(false);
        } else {
            currentToken = token;
            const googleUserInfo = await fetchUserInfo(token);
            if (googleUserInfo) {
                // syncUserWithBackend now returns the full user object from backend
                const backendUserInfo = await syncUserWithBackend(googleUserInfo);
                 if (backendUserInfo) {
                    // Pass the full backend user info (including metrics) to updateUI
                    updateUI(true, backendUserInfo);
                    showStatus('Signed in and data synced.', false);
                 } else {
                     // Still update UI with Google info, but show sync error and 0 metrics
                     updateUI(true, { ...googleUserInfo, metrics: { x: 0, reddit: 0, linkedin: 0, chatgpt: 0 } }); 
                     showStatus('Signed in, but failed to sync data with backend.', true);
                 }
            } else {
                showStatus('Had token, but failed to get info. Please sign in again.', true);
                chrome.identity.removeCachedAuthToken({ token: currentToken }, () => {
                    updateUI(false);
                    currentToken = null;
                });
            }
        }
    });
}); 