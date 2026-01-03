// Background Service Worker (Manifest V3)
console.log("X Bot Helper: Background service worker loaded");

// Listen for extension icon clicks
chrome.action.onClicked.addListener((tab) => {
  // Open popup (default behavior)
  console.log("Extension icon clicked");
});

// Listen for tab updates to inject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    if (tab.url.includes("twitter.com") || tab.url.includes("x.com")) {
      console.log("Twitter/X page detected");
    }
  }
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Background received message:", request);
  sendResponse({ status: "received" });
  return true;
});
