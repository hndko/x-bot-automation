// Popup JS - Handle UI interactions
let isRunning = false;

// DOM Elements
const btnDelete = document.getElementById("btnDelete");
const btnUnretweet = document.getElementById("btnUnretweet");
const btnUnlike = document.getElementById("btnUnlike");
const status = document.getElementById("status");
const statusText = document.getElementById("statusText");
const progressBar = document.getElementById("progressBar");
const statProcessed = document.getElementById("statProcessed");
const statSuccess = document.getElementById("statSuccess");
const statFailed = document.getElementById("statFailed");

// Settings
const delayInput = document.getElementById("delay");
const batchSizeInput = document.getElementById("batchSize");
const maxActionsInput = document.getElementById("maxActions");

// Load saved settings
chrome.storage.sync.get(["delay", "batchSize", "maxActions"], (result) => {
  if (result.delay) delayInput.value = result.delay;
  if (result.batchSize) batchSizeInput.value = result.batchSize;
  if (result.maxActions) maxActionsInput.value = result.maxActions;
});

// Save settings on change
delayInput.addEventListener("change", () => {
  chrome.storage.sync.set({ delay: parseInt(delayInput.value) });
});

batchSizeInput.addEventListener("change", () => {
  chrome.storage.sync.set({ batchSize: parseInt(batchSizeInput.value) });
});

maxActionsInput.addEventListener("change", () => {
  chrome.storage.sync.set({ maxActions: parseInt(maxActionsInput.value) });
});

// Get active tab and send message with better error handling
async function sendMessageToTab(action) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // Check if on Twitter/X
  if (!tab.url.includes("twitter.com") && !tab.url.includes("x.com")) {
    statusText.textContent = "❌ Please open Twitter/X page first!";
    status.classList.add("active");
    return;
  }

  const settings = {
    delay: parseInt(delayInput.value) * 1000,
    batchSize: parseInt(batchSizeInput.value),
    maxActions: parseInt(maxActionsInput.value) || Infinity,
  };

  // Show status
  status.classList.add("active");
  statusText.textContent = "🔄 Starting...";
  isRunning = true;
  disableButtons();

  try {
    // Try to ping content script first
    await chrome.tabs
      .sendMessage(tab.id, { action: "ping" })
      .catch(async (error) => {
        // Content script not loaded, inject it manually
        statusText.textContent = "📥 Loading script... Please wait.";

        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content.js"],
          });

          // Wait for script to initialize
          await new Promise((resolve) => setTimeout(resolve, 1500));

          // Try ping again
          return chrome.tabs.sendMessage(tab.id, { action: "ping" });
        } catch (injectError) {
          throw new Error(
            "Failed to load script. Please reload the page and try again!"
          );
        }
      });

    // Now send the actual action
    statusText.textContent = "🚀 Running...";

    await chrome.tabs.sendMessage(tab.id, {
      action: action,
      settings: settings,
    });
  } catch (error) {
    console.error("Extension error:", error);

    // Show helpful error message
    if (error.message.includes("Receiving end does not exist")) {
      statusText.textContent =
        "❌ Please reload the Twitter page (F5) and try again!";
    } else {
      statusText.textContent = "❌ Error: " + error.message;
    }

    enableButtons();
    isRunning = false;
  }
}

// Listen for updates from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "progress") {
    updateProgress(request.data);
  } else if (request.type === "complete") {
    statusText.textContent = "✅ Completed!";
    enableButtons();
    isRunning = false;
  } else if (request.type === "error") {
    statusText.textContent = "❌ Error: " + request.message;
    enableButtons();
    isRunning = false;
  }
});

function updateProgress(data) {
  statusText.textContent = data.message;

  if (data.total > 0) {
    const percentage = (data.processed / data.total) * 100;
    progressBar.style.width = percentage + "%";
  }

  statProcessed.textContent = data.processed || 0;
  statSuccess.textContent = data.success || 0;
  statFailed.textContent = data.failed || 0;
}

function disableButtons() {
  btnDelete.disabled = true;
  btnUnretweet.disabled = true;
  btnUnlike.disabled = true;
}

function enableButtons() {
  btnDelete.disabled = false;
  btnUnretweet.disabled = false;
  btnUnlike.disabled = false;
}

// Button click handlers
btnDelete.addEventListener("click", async () => {
  if (isRunning) return;

  if (
    confirm("⚠️ Are you sure you want to delete posts? This cannot be undone!")
  ) {
    await sendMessageToTab("delete_posts");
  }
});

btnUnretweet.addEventListener("click", async () => {
  if (isRunning) return;
  await sendMessageToTab("undo_retweets");
});

btnUnlike.addEventListener("click", async () => {
  if (isRunning) return;
  await sendMessageToTab("undo_likes");
});
