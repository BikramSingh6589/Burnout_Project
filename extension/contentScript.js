// Function to get token from localStorage
function getTokenFromPage() {
  const token = localStorage.getItem('burnout_auth_token');
  return token;
}

// Function to send install notification
const sendInstallNotification = () => {
  window.postMessage({ type: 'BURN_OUT_GUARD_IS_INSTALLED' }, '*');
};

// Save token to extension storage immediately
const token = getTokenFromPage();
if (token) {
  chrome.storage.local.set({ authToken: token }).catch(() => {});
}

// Set up interval to check for token every second for 10 seconds
let checkCount = 0;
const checkInterval = setInterval(() => {
  checkCount++;
  const token = getTokenFromPage();
  if (token) {
    chrome.storage.local.set({ authToken: token }).catch(() => {});
  }
  if (checkCount >= 10) {
    clearInterval(checkInterval);
  }
}, 1000);

// Also listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_TOKEN') {
    const token = getTokenFromPage();
    if (token) {
      chrome.storage.local.set({ authToken: token }).then(() => {
        sendResponse({ success: true, token: token });
      });
    } else {
      sendResponse({ success: false, token: null });
    }
    return true; // Keep channel open for async response
  }
});

// Listen for check message from website
window.addEventListener('message', (event) => {
  if (event.data.type === 'BURN_OUT_GUARD_CHECK_INSTALLED') {
    sendInstallNotification();
  }
});

// Notify website we're here - send multiple times to be sure
sendInstallNotification();
// Send repeatedly for 5 seconds to make sure website receives it
const notifyInterval = setInterval(sendInstallNotification, 300);
setTimeout(() => clearInterval(notifyInterval), 5000);
