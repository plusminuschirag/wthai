const signInButton = document.getElementById('signInButton');
const signOutButton = document.getElementById('signOutButton');
const userInfoDiv = document.getElementById('userInfo');
const userEmailSpan = document.getElementById('userEmail');
const signInSectionDiv = document.getElementById('signInSection');
const statusDiv = document.getElementById('status');

let currentToken = null; // Store the token for sign-out

function updateUI(signedIn, email = '') {
    if (signedIn) {
        signInSectionDiv.style.display = 'none';
        userInfoDiv.style.display = 'block';
        userEmailSpan.textContent = email;
        statusDiv.textContent = '';
    } else {
        signInSectionDiv.style.display = 'block';
        userInfoDiv.style.display = 'none';
        userEmailSpan.textContent = '';
        currentToken = null;
    }
}

function showStatus(message, isError = false) {
    console.log(message);
    statusDiv.textContent = message;
    statusDiv.style.color = isError ? 'red' : 'green';
}

// Function to fetch user info using the token
async function fetchUserInfo(token) {
    // Note: For basic email/profile, chrome.identity.getProfileUserInfo is easier
    // But if you need to call other Google APIs, you'd use fetch like this:
    /*
    try {
        const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }
        const data = await response.json();
        return data.email;
    } catch (error) {
        showStatus(`Error fetching user info: ${error.message}`, true);
        return null;
    }
    */

    // Simpler way using chrome.identity.getProfileUserInfo
    try {
        const userInfo = await chrome.identity.getProfileUserInfo({ accountStatus: 'ANY' });
        return userInfo.email;
    } catch (error) {
        // This can happen if the user is not signed into Chrome or has multiple accounts and hasn't chosen
        console.error("Error getting profile user info:", error);
        showStatus(`Could not retrieve user email. Are you signed into Chrome?`, true);
        return null;
    }
}

// --- Event Listeners --- 

signInButton.addEventListener('click', () => {
    showStatus('Attempting sign in...');
    // Start interactive sign-in
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
        showStatus('Sign in successful. Fetching user info...', false);
        
        const email = await fetchUserInfo(token);
        
        if (email) {
            updateUI(true, email);
            showStatus('Successfully signed in!', false);
            // You can store the token/email in chrome.storage.local if needed
            // chrome.storage.local.set({ userEmail: email, authToken: token });
        } else {
             // Error shown in fetchUserInfo, sign out partially
             showStatus('Sign in succeeded, but failed to get email.', true);
             // Attempt to remove the potentially problematic token
             chrome.identity.removeCachedAuthToken({ token: currentToken }, () => {
                updateUI(false);
                currentToken = null;
             });
        }
    });
});

signOutButton.addEventListener('click', () => {
    if (currentToken) {
        // Remove the cached token
        chrome.identity.removeCachedAuthToken({ token: currentToken }, () => {
            if (chrome.runtime.lastError) {
                showStatus(`Sign out failed: ${chrome.runtime.lastError.message}`, true);
            } else {
                showStatus('Signed out successfully.', false);
                updateUI(false);
                // Clear any stored info
                // chrome.storage.local.remove(['userEmail', 'authToken']);
            }
        });
    } else {
        showStatus('Already signed out.', false);
        updateUI(false); // Ensure UI is in signed-out state
    }
});

// --- Initial Check on Popup Load --- 

document.addEventListener('DOMContentLoaded', () => {
    showStatus('Checking sign-in status...');
    // Try to get token non-interactively
    chrome.identity.getAuthToken({ interactive: false }, async (token) => {
        if (chrome.runtime.lastError || !token) {
            // Not signed in or requires interaction
            showStatus('Please sign in.', false); // Not an error, just informational
            updateUI(false);
        } else {
            // Already signed in
            currentToken = token;
            showStatus('Already signed in. Fetching info...', false);
            const email = await fetchUserInfo(token);
            if (email) {
                updateUI(true, email);
                 showStatus('Successfully signed in!', false);
            } else {
                // Had a token, but couldn't get email -> sign out state
                showStatus('Signed in, but failed to get email. Please sign in again.', true);
                chrome.identity.removeCachedAuthToken({ token: currentToken }, () => {
                    updateUI(false);
                    currentToken = null;
                });
            }
        }
    });
}); 