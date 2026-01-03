// Popup JS - Handle UI interactions with Phase 1 features
let isRunning = false;
let isPaused = false;
let currentAction = null;

// DOM Elements
const btnDelete = document.getElementById("btnDelete");
const btnUnretweet = document.getElementById("btnUnretweet");
const btnUnlike = document.getElementById("btnUnlike");
const btnPause = document.getElementById("btnPause");
const btnStop = document.getElementById("btnStop");
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
const dryRunCheckbox = document.getElementById("dryRun");
const dateFromInput = document.getElementById("dateFrom");
const dateToInput = document.getElementById("dateTo");
const pauseIcon = document.getElementById("pauseIcon");
const pauseText = document.getElementById("pauseText");

// Load saved settings
chrome.storage.sync.get(
  ["delay", "batchSize", "maxActions", "dryRun", "dateFrom", "dateTo"],
  (result) => {
    if (result.delay) delayInput.value = result.delay;
    if (result.batchSize) batchSizeInput.value = result.batchSize;
    if (result.maxActions) maxActionsInput.value = result.maxActions;
    if (result.dryRun !== undefined) dryRunCheckbox.checked = result.dryRun;
    if (result.dateFrom) dateFromInput.value = result.dateFrom;
    if (result.dateTo) dateToInput.value = result.dateTo;
  }
);

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

dryRunCheckbox.addEventListener("change", () => {
  chrome.storage.sync.set({ dryRun: dryRunCheckbox.checked });
});

dateFromInput.addEventListener("change", () => {
  chrome.storage.sync.set({ dateFrom: dateFromInput.value });
});

dateToInput.addEventListener("change", () => {
  chrome.storage.sync.set({ dateTo: dateToInput.value });
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
    dryRun: dryRunCheckbox.checked,
    dateFrom: dateFromInput.value || null,
    dateTo: dateToInput.value || null,
  };

  // Show status
  status.classList.add("active");
  statusText.textContent = settings.dryRun
    ? "🧪 DRY RUN MODE - No actual changes"
    : "🔄 Starting...";
  isRunning = true;
  isPaused = false;
  currentAction = action;
  disableButtons();
  showControlButtons();

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
    statusText.textContent = settings.dryRun
      ? "🧪 DRY RUN: Scanning..."
      : "🚀 Running...";

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
    hideControlButtons();
    isRunning = false;
  }
}

// Pause/Resume functionality
btnPause.addEventListener("click", async () => {
  isPaused = !isPaused;

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, {
    action: "togglePause",
    paused: isPaused,
  });

  if (isPaused) {
    pauseIcon.textContent = "▶️";
    pauseText.textContent = "Resume";
    statusText.textContent = "⏸️ PAUSED - Click Resume to continue";
  } else {
    pauseIcon.textContent = "⏸️";
    pauseText.textContent = "Pause";
    statusText.textContent = "▶️ Resumed...";
  }
});

// Stop functionality
btnStop.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.tabs.sendMessage(tab.id, {
    action: "stop",
  });

  statusText.textContent = "🛑 Stopped by user";
  enableButtons();
  hideControlButtons();
  isRunning = false;
  isPaused = false;
});

function showControlButtons() {
  btnPause.style.display = "block";
  btnStop.style.display = "block";
}

function hideControlButtons() {
  btnPause.style.display = "none";
  btnStop.style.display = "none";
  pauseIcon.textContent = "⏸️";
  pauseText.textContent = "Pause";
}

// Listen for updates from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "progress") {
    updateProgress(request.data);
  } else if (request.type === "complete") {
    statusText.textContent = "✅ Completed!";
    enableButtons();
    hideControlButtons();
    isRunning = false;
    isPaused = false;
  } else if (request.type === "error") {
    statusText.textContent = "❌ Error: " + request.message;
    enableButtons();
    hideControlButtons();
    isRunning = false;
    isPaused = false;
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

  const confirmMsg = dryRunCheckbox.checked
    ? "🧪 DRY RUN: Preview what would be deleted?"
    : "⚠️ Are you sure you want to delete posts? This cannot be undone!";

  if (confirm(confirmMsg)) {
    await sendMessageToTab("delete_posts");
  }
});

btnUnretweet.addEventListener("click", async () => {
  if (isRunning) return;

  if (dryRunCheckbox.checked || confirm("Undo retweets?")) {
    await sendMessageToTab("undo_retweets");
  }
});

btnUnlike.addEventListener("click", async () => {
  if (isRunning) return;

  if (dryRunCheckbox.checked || confirm("Unlike tweets?")) {
    await sendMessageToTab("undo_likes");
  }
});

// Phase 2: Export button handler
document.getElementById('btnExport').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tab.id, { action: 'exportLogs' }, (response) => {
    if (response && response.logs) {
      // Convert to CSV
      const csv = convertToCSV(response.logs);
      
      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `x-bot-logs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      
      alert(`📊 Exported ${response.logs.length} actions to CSV!`);
    }
  });
});

//Phase 2: Continue session handler  
document.getElementById('btnContinue').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tab.id, { action: 'continueSession' }, (response) => {
    if (response && response.continued) {
      alert('⏩ Continuing from last session!');
    } else {
      alert('❌ No saved session found');
    }
  });
});

// Helper: Convert logs to CSV
function convertToCSV(logs) {
  if (!logs || logs.length === 0) return '';
  
  const headers = ['Timestamp', 'Action', 'Status', 'Tweet URL', 'Details'];
  const rows = logs.map(log => [
    log.timestamp,
    log.action,
    log.status,
    log.tweetUrl || '',
    log.details || ''
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  return csvContent;
}

// Check for saved progress on load
chrome.storage.local.get(['savedProgress'], (result) => {
  if (result.savedProgress) {
    document.getElementById('btnContinue').style.display = 'block';
  }
});

// Phase 3: Notification sounds
const sounds = {
  success: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGJ0fPTgjMGHm7A7+OZUBAM'),
  error: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGJ0fPTgjMGHm7A7+OZUBAM'),
  complete: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGJ0fPTgjMGHm7A7+OZUBAM')
};

function playSound(type) {
  chrome.storage.sync.get(['soundEnabled'], (result) => {
    if (result.soundEnabled !== false && sounds[type]) {
      sounds[type].play().catch(() => {});
    }
  });
}

// Phase 3: Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (isRunning) {
    // Space = Pause/Resume
    if (e.code === 'Space') {
      e.preventDefault();
      btnPause.click();
    }
    // Escape = Stop
    if (e.code === 'Escape') {
      e.preventDefault();
      btnStop.click();
    }
  } else {
    // Ctrl+D = Delete Posts
    if (e.ctrlKey && e.code === 'KeyD') {
      e.preventDefault();
      btnDelete.click();
    }
    // Ctrl+R = Undo Retweets
    if (e.ctrlKey && e.code === 'KeyR') {
      e.preventDefault();
      btnUnretweet.click();
    }
    // Ctrl+L = Undo Likes
    if (e.ctrlKey && e.code === 'KeyL') {
      e.preventDefault();
      btnUnlike.click();
    }
  }
});

// Phase 3: Performance tracking
let perfStartTime = null;
let perfStats = { total: 0, success: 0, failed: 0, startTime: null };

function updatePerformance(data) {
  if (!perfStartTime) perfStartTime = Date.now();
  
  perfStats.total = data.processed;
  perfStats.success = data.success;
  perfStats.failed = data.failed;
  
  const elapsed = (Date.now() - perfStartTime) / 1000; // seconds
  const rate = data.processed / elapsed; // actions per second
  const remaining = data.total - data.processed;
  const eta = remaining > 0 ? remaining / rate : 0;
  
  // Show in status
  if (elapsed > 5) { // Only show after 5 seconds
    const rateMin = (rate * 60).toFixed(1);
    const etaMin = (eta / 60).toFixed(1);
    
    // Could update UI here if we had a performance display element
    console.log(`📈 Rate: ${rateMin}/min | ETA: ${etaMin}min`);
  }
}

