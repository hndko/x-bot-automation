// Content Script - Runs on Twitter/X pages
console.log("X Bot Helper: Content script loaded");
console.log("👨‍💻 Made by Kyoo | 🏢 Mari Partner");

// Global state for pause/resume and stop
let globalPaused = false;
let globalStop = false;

// Global state for Phase 2 features
let actionLogs = []; // For export
let failedItems = []; // For auto-retry
let savedProgress = null; // For persistence

// Helper function: sleep/delay
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper function: check if paused and wait
async function checkPauseAndStop() {
  while (globalPaused && !globalStop) {
    await sleep(500); // Check every 500ms
  }
  if (globalStop) {
    throw new Error("Stopped by user");
  }
}

// Helper function: random delay with normal distribution
function randomDelay(min, max) {
  const mean = (min + max) / 2;
  const stdDev = (max - min) / 6;
  const u1 = Math.random();
  const u2 = Math.random();
  const randStdNormal =
    Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
  let delay = Math.round(mean + stdDev * randStdNormal);
  return Math.max(min, Math.min(max, delay));
}

// Helper function: scroll to load more content
async function scrollToLoad() {
  window.scrollTo(0, document.body.scrollHeight);
  await sleep(2000);
}

// Helper function: parse tweet date from time element
function getTweetDate(tweetElement) {
  try {
    const timeElement = tweetElement.querySelector("time");
    if (!timeElement || !timeElement.getAttribute("datetime")) {
      return null;
    }
    return new Date(timeElement.getAttribute("datetime"));
  } catch (e) {
    return null;
  }
}

// Helper function: check if date is in range
function isDateInRange(tweetDate, dateFrom, dateTo) {
  if (!tweetDate) return true; // If can't parse, process anyway

  if (dateFrom) {
    const from = new Date(dateFrom);
    from.setHours(0, 0, 0, 0);
    if (tweetDate < from) return false;
  }

  if (dateTo) {
    const to = new Date(dateTo);
    to.setHours(23, 59, 59, 999);
    if (tweetDate > to) return false;
  }

  return true;
}

// Helper function: log action for export
function logAction(action, status, tweetUrl = "", details = "") {
  const log = {
    timestamp: new Date().toISOString(),
    action: action,
    status: status, // success/failed/skipped
    tweetUrl: tweetUrl,
    details: details,
  };
  actionLogs.push(log);

  // Also save to localStorage for persistence
  try {
    chrome.storage.local.set({ actionLogs: actionLogs });
  } catch (e) {
    console.warn("Failed to save logs:", e);
  }
}

// Helper function: save progress for persistence
async function saveProgress(action, stats, settings) {
  const progress = {
    action: action,
    stats: stats,
    settings: settings,
    timestamp: new Date().toISOString(),
  };

  try {
    await chrome.storage.local.set({ savedProgress: progress });
    console.log("💾 Progress saved");
  } catch (e) {
    console.warn("Failed to save progress:", e);
  }
}

// Helper function: clear saved progress
async function clearProgress() {
  try {
    await chrome.storage.local.remove("savedProgress");
    console.log("🗑️ Progress cleared");
  } catch (e) {
    console.warn("Failed to clear progress:", e);
  }
}

// Send progress update to popup
function sendProgress(message, processed, total, success, failed) {
  console.log(
    `📊 Progress: ${message} | P:${processed} S:${success} F:${failed}`
  );
  chrome.runtime.sendMessage({
    type: "progress",
    data: { message, processed, total, success, failed },
  });
}

// Send completion message
function sendComplete() {
  console.log("✅ Process complete");
  chrome.runtime.sendMessage({ type: "complete" });
}

// Send error message
function sendError(message) {
  console.error("❌ Error:", message);
  chrome.runtime.sendMessage({ type: "error", message });
}

// IMPROVED Delete Posts Action
async function deletePosts(settings) {
  try {
    console.log("🗑️ Starting delete posts with settings:", settings);
    sendProgress("Checking profile page...", 0, 0, 0, 0);

    // Verify on profile page
    if (!window.location.pathname.match(/^\/[^\/]+\/?$/)) {
      throw new Error(
        "Please navigate to YOUR profile page first! (e.g., x.com/yourusername)"
      );
    }

    let stats = { processed: 0, success: 0, failed: 0 };
    let emptyScrollCount = 0;

    while (stats.processed < settings.maxActions && emptyScrollCount < 5) {
      console.log(
        `\n--- Loop iteration: processed=${stats.processed}, limit=${settings.maxActions} ---`
      );

      // Find tweets
      const tweets = Array.from(
        document.querySelectorAll('article[data-testid="tweet"]')
      );
      console.log(`Found ${tweets.length} tweets on page`);

      if (tweets.length === 0) {
        emptyScrollCount++;
        console.log(`No tweets found, empty count: ${emptyScrollCount}/5`);
        sendProgress(
          `Scrolling to find posts... (${emptyScrollCount}/5)`,
          stats.processed,
          settings.maxActions,
          stats.success,
          stats.failed
        );
        await scrollToLoad();
        continue;
      }

      emptyScrollCount = 0;

      // Process FIRST tweet only (one by one)
      const tweet = tweets[0];
      console.log(`\n🎯 Processing tweet ${stats.processed + 1}`);

      try {
        // Check pause/stop state
        await checkPauseAndStop();

        // Check date filter (if enabled)
        if (settings.dateFrom || settings.dateTo) {
          const tweetDate = getTweetDate(tweet);
          if (!isDateInRange(tweetDate, settings.dateFrom, settings.dateTo)) {
            console.log("📅 Tweet outside date range, skipping...");
            stats.processed++;
            await scrollToLoad();
            await sleep(500);
            continue;
          }
        }

        // Step 1: Find and click MORE button (three dots)
        const moreButton = tweet.querySelector('[data-testid="caret"]');

        if (!moreButton) {
          console.log(
            "⚠️ No more button (might be promoted tweet), scrolling..."
          );
          await scrollToLoad();
          await sleep(1000);
          continue;
        }

        sendProgress(
          `📝 Opening menu for post ${stats.processed + 1}...`,
          stats.processed,
          settings.maxActions,
          stats.success,
          stats.failed
        );
        console.log("✓ Found more button, clicking...");

        moreButton.click();
        await sleep(1000); // Wait for menu to open

        // Step 2: Find DELETE button in menu
        console.log("Looking for delete button in menu...");
        const menuItems = Array.from(
          document.querySelectorAll('[role="menuitem"]')
        );
        console.log(`Found ${menuItems.length} menu items`);

        let deleteButton = null;
        for (const item of menuItems) {
          const text = item.textContent.toLowerCase();
          console.log(`  - Menu item: "${text}"`);
          if (text.includes("delete") || text.includes("hapus")) {
            deleteButton = item;
            console.log("  ✓ Found DELETE button!");
            break;
          }
        }

        if (!deleteButton) {
          console.log(
            "❌ No delete button found (might be someone else's tweet or retweet)"
          );
          stats.failed++;
          stats.processed++;
          consecutiveSkips++;

          // Close menu
          document.body.click();
          await sleep(500);

          sendProgress(
            `⊝ Skipped post ${stats.processed} (can\'t delete)`,
            stats.processed,
            settings.maxActions,
            stats.success,
            stats.failed
          );

          // If we've skipped 3 tweets in a row, scroll to find new ones
          if (consecutiveSkips >= 3) {
            console.log("⚠️ Multiple consecutive skips, scrolling for more...");
            await scrollToLoad();
            await sleep(1500);
            consecutiveSkips = 0; // Reset counter
          }

          continue;
        }

        // Reset consecutive skips on successful delete button found
        consecutiveSkips = 0;

        // Step 3: Click DELETE
        console.log("Clicking delete button...");
        deleteButton.click();
        await sleep(1000); // Wait for confirmation dialog

        // Step 4: Find and click CONFIRM button
        console.log("Looking for confirmation button...");
        const confirmButton = document.querySelector(
          '[data-testid="confirmationSheetConfirm"]'
        );

        if (!confirmButton) {
          console.log("❌ Confirmation button not found!");
          stats.failed++;
          stats.processed++;

          // Try to close dialog
          const escEvent = new KeyboardEvent("keydown", {
            key: "Escape",
            code: "Escape",
            keyCode: 27,
          });
          document.dispatchEvent(escEvent);
          await sleep(500);

          sendProgress(
            `⊝ Failed to confirm delete ${stats.processed}`,
            stats.processed,
            settings.maxActions,
            stats.success,
            stats.failed
          );
          continue;
        }

        console.log("✓ Found confirm button, clicking...");

        // DRY RUN MODE: Skip actual deletion
        if (settings.dryRun) {
          console.log("🧪 DRY RUN: Would delete this post");
          stats.success++;
          stats.processed++;

          // Close the dialog
          const escEvent = new KeyboardEvent("keydown", {
            key: "Escape",
            code: "Escape",
            keyCode: 27,
          });
          document.dispatchEvent(escEvent);
          await sleep(500);

          sendProgress(
            `🧪 DRY RUN: Would delete ${stats.success}/${stats.processed}`,
            stats.processed,
            settings.maxActions,
            stats.success,
            stats.failed
          );

          // Small delay to simulate
          await sleep(1000);
        } else {
          // ACTUAL DELETE
          confirmButton.click();

          // SUCCESS!
          stats.success++;
          stats.processed++;

          console.log(`✅ Successfully deleted tweet ${stats.processed}!`);
          sendProgress(
            `✅ Deleted ${stats.success}/${stats.processed} posts`,
            stats.processed,
            settings.maxActions,
            stats.success,
            stats.failed
          );

          // Wait for deletion to complete
          await sleep(2000);
        }

        // Check pause state before delay
        await checkPauseAndStop();

        // Human-like delay before next action
        const delay = randomDelay(settings.delay * 0.8, settings.delay * 1.2);
        const delaySec = Math.round(delay / 1000);
        console.log(`⏳ Waiting ${delaySec}s before next action...`);
        sendProgress(
          `⏳ Waiting ${delaySec}s before next...`,
          stats.processed,
          settings.maxActions,
          stats.success,
          stats.failed
        );
        await sleep(delay);

        // Check pause again after delay
        await checkPauseAndStop();

        // Batch rest
        if (stats.processed % settings.batchSize === 0) {
          console.log(
            `📊 Batch complete (${stats.processed}), taking 30s break...`
          );
          sendProgress(
            "☕ Taking 30s break...",
            stats.processed,
            settings.maxActions,
            stats.success,
            stats.failed
          );
          await sleep(30000);
        }
      } catch (err) {
        console.error("❌ Error processing tweet:", err);
        stats.failed++;
        stats.processed++;

        // Close any open dialogs
        document.body.click();
        await sleep(500);

        sendProgress(
          `❌ Error on tweet ${stats.processed}`,
          stats.processed,
          settings.maxActions,
          stats.success,
          stats.failed
        );
      }

      // Small delay before next iteration
      await sleep(1000);
    }

    // Final summary
    console.log("\n=== DELETE COMPLETE ===");
    console.log(`Total processed: ${stats.processed}`);
    console.log(`Successful: ${stats.success}`);
    console.log(`Failed/Skipped: ${stats.failed}`);

    // Determine why we stopped
    let stopReason = "";
    if (stats.processed >= settings.maxActions) {
      stopReason = "(reached max actions)";
    } else if (emptyScrollCount >= 5) {
      stopReason = "(no more posts found)";
    }

    sendProgress(
      `🎉 Complete! Deleted ${stats.success} of ${stats.processed} posts ${stopReason}`,
      stats.processed,
      stats.processed,
      stats.success,
      stats.failed
    );
    await sleep(1000);
    sendComplete();
  } catch (error) {
    console.error("Fatal error in deletePosts:", error);
    sendError(error.message);
  }
}

// Undo Retweets Action
async function undoRetweets(settings) {
  try {
    sendProgress("Looking for retweets...", 0, 0, 0, 0);

    let stats = { processed: 0, success: 0, failed: 0 };
    let emptyScrollCount = 0;
    let consecutiveSkips = 0;

    while (stats.processed < settings.maxActions && emptyScrollCount < 5) {
      const tweets = document.querySelectorAll('article[data-testid="tweet"]');

      if (tweets.length === 0) {
        emptyScrollCount++;
        console.log(`No tweets found, empty count: ${emptyScrollCount}/5`);
        sendProgress(
          `Scrolling to find retweeted posts... (${emptyScrollCount}/5)`,
          stats.processed,
          settings.maxActions,
          stats.success,
          stats.failed
        );
        await scrollToLoad();
        await sleep(2000);
        continue;
      }

      // Reset empty counter when we find tweets
      emptyScrollCount = 0;
      let foundRetweetedTweet = false;

      for (const tweet of tweets) {
        if (stats.processed >= settings.maxActions) break;

        try {
          // Check pause/stop
          await checkPauseAndStop();

          // Check date filter (if enabled)
          if (settings.dateFrom || settings.dateTo) {
            const tweetDate = getTweetDate(tweet);
            if (!isDateInRange(tweetDate, settings.dateFrom, settings.dateTo)) {
              console.log('📅 Retweet outside date range, skipping...');
              continue;
            }
          }

          const unretweetButton = tweet.querySelector('[data-testid="unretweet"]');

          if (unretweetButton) {
            foundRetweetedTweet = true;

            // DRY RUN MODE
            if (settings.dryRun) {
              console.log('🧪 DRY RUN: Would undo this retweet');
              stats.success++;
              stats.processed++;
              sendProgress(`🧪 DRY RUN: Would undo ${stats.success}/${stats.processed} retweets`, stats.processed, settings.maxActions, stats.success, stats.failed);
              await sleep(1000);
            } else {
              // ACTUAL UNRETWEET
              unretweetButton.click();
              await sleep(500);

              const confirmButton = document.querySelector('[data-testid="unretweetConfirm"]');

              if (confirmButton) {
                confirmButton.click();
                stats.success++;
                stats.processed++;

                logAction('undo_retweets', 'success', '', 'Undone retweet');

                await sleep(randomDelay(settings.delay * 0.8, settings.delay * 1.2));

                sendProgress(
                  `Undone ${stats.success} retweets...`,
                  stats.processed,
                  settings.maxActions,
                  stats.success,
                  stats.failed
                );
              } else {
                console.log('❌ Confirm button not found');
                stats.failed++;
                stats.processed++;
              }
            }

            // Check pause before batch rest
            await checkPauseAndStop();

            if (stats.processed % settings.batchSize === 0) {
              sendProgress(
                "Taking a break...",
                stats.processed,
                settings.maxActions,
                stats.success,
                stats.failed
              );
              await sleep(30000);
            }

            // Save progress
            await saveProgress('undo_retweets', stats, settings);
          }
        } catch (err) {
          stats.failed++;
          stats.processed++;

// Undo Likes Action
async function undoLikes(settings) {
  try {
    sendProgress("Navigating to likes page...", 0, 0, 0, 0);

    if (!window.location.pathname.includes("/likes")) {
      const username = window.location.pathname.split("/")[1];
      window.location.href = `https://x.com/${username}/likes`;
      await sleep(3000);
    }

    let stats = { processed: 0, success: 0, failed: 0 };
    let failedItems = [];
    let emptyScrollCount = 0;
    let consecutiveSkips = 0;

    while (stats.processed < settings.maxActions && emptyScrollCount < 5) {
      const tweets = document.querySelectorAll('article[data-testid="tweet"]');

      if (tweets.length === 0) {
        emptyScrollCount++;
        console.log(`No tweets found, empty count: ${emptyScrollCount}/5`);
        sendProgress(
          `Scrolling to find liked tweets... (${emptyScrollCount}/5)`,
          stats.processed,
          settings.maxActions,
          stats.success,
          stats.failed
        );
        await scrollToLoad();
        await sleep(2000);
        continue;
      }

      // Reset empty counter when we find tweets
      emptyScrollCount = 0;
      let foundLikedTweet = false;

      for (const tweet of tweets) {
        if (stats.processed >= settings.maxActions) break;

        try {
          // Check pause/stop
          await checkPauseAndStop();

          const unlikeButton = tweet.querySelector('[data-testid="unlike"]');

          if (unlikeButton) {
            foundLikedTweet = true;

            // DRY RUN MODE
            if (settings.dryRun) {
              console.log("🧪 DRY RUN: Would unlike this tweet");
              stats.success++;
              stats.processed++;
              sendProgress(
                `🧪 DRY RUN: Would unlike ${stats.success}/${stats.processed}`,
                stats.processed,
                settings.maxActions,
                stats.success,
                stats.failed
              );
              await sleep(1000);
            } else {
              // ACTUAL UNLIKE
              unlikeButton.click();
              stats.success++;
              stats.processed++;

              logAction("undo_likes", "success", "", "Unliked tweet");

              await sleep(
                randomDelay(settings.delay * 0.8, settings.delay * 1.2)
              );

              sendProgress(
                `Unliked ${stats.success} tweets...`,
                stats.processed,
                settings.maxActions,
                stats.success,
                stats.failed
              );
            }

            // Check pause before batch rest
            await checkPauseAndStop();

            if (stats.processed % settings.batchSize === 0) {
              sendProgress(
                "Taking a break...",
                stats.processed,
                settings.maxActions,
                stats.success,
                stats.failed
              );
              await sleep(30000);
            }

            // Save progress
            await saveProgress("undo_likes", stats, settings);
          }
        } catch (err) {
          stats.failed++;
          stats.processed++;
          console.error("Error unliking tweet:", err);
          failedItems.push({
            type: "unlike",
            tweet: tweet,
            error: err.message,
          });
        }
      }

      // If no liked tweets found in this batch, scroll for more
      if (!foundLikedTweet) {
        consecutiveSkips++;
        console.log(
          `⚠️ No liked tweets in current view (${consecutiveSkips}/3)`
        );

        if (consecutiveSkips >= 3) {
          console.log("❌ No more liked tweets found after 3 scrolls");
          break;
        }

        await scrollToLoad();
        await sleep(2000);
      } else {
        consecutiveSkips = 0;
        await scrollToLoad();
        await sleep(1000);
      }
    }

    // Final summary
    console.log("\n=== UNLIKE COMPLETE ===");
    console.log(`Total processed: ${stats.processed}`);
    console.log(`Successful: ${stats.success}`);
    console.log(`Failed: ${stats.failed}`);

    let stopReason = "";
    if (stats.processed >= settings.maxActions) {
      stopReason = "(reached max actions)";
    } else if (emptyScrollCount >= 5) {
      stopReason = "(no more tweets found)";
    } else if (consecutiveSkips >= 3) {
      stopReason = "(no more liked tweets)";
    }

    await clearProgress();

    sendProgress(
      `🎉 Complete! Unliked ${stats.success} of ${stats.processed} tweets ${stopReason}`,
      stats.processed,
      stats.processed,
      stats.success,
      stats.failed
    );
  } catch (error) {
    sendError(error.message);
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Ping to check if content script is loaded
  if (request.action === "ping") {
    console.log("📡 Ping received");
    sendResponse({ status: "ready" });
    return true;
  }

  console.log(
    "📨 Received action:",
    request.action,
    "with settings:",
    request.settings
  );

  // Handle pause/resume
  if (request.action === "togglePause") {
    globalPaused = request.paused;
    console.log(globalPaused ? "⏸️ PAUSED" : "▶️ RESUMED");
    sendResponse({ status: "paused", paused: globalPaused });
    return true;
  }

  // Handle stop
  if (request.action === "stop") {
    globalStop = true;
    console.log("🛑 STOP requested");
    sendResponse({ status: "stopped" });
    return true;
  }

  // Handle export logs
  if (request.action === "exportLogs") {
    console.log(`📊 Exporting ${actionLogs.length} logs`);
    sendResponse({ logs: actionLogs });
    return true;
  }

  // Handle continue session
  if (request.action === "continueSession") {
    chrome.storage.local.get(["savedProgress"], (result) => {
      if (result.savedProgress) {
        const progress = result.savedProgress;
        console.log("⏩ Continuing session:", progress.action);

        // Resume the action with saved state
        if (progress.action === "delete_posts") {
          deletePosts(progress.settings, progress.stats);
        } else if (progress.action === "undo_retweets") {
          undoRetweets(progress.settings, progress.stats);
        } else if (progress.action === "undo_likes") {
          undoLikes(progress.settings, progress.stats);
        }

        sendResponse({ continued: true });
      } else {
        sendResponse({ continued: false });
      }
    });
    return true;
  }

  // Reset global state for new actions
  globalPaused = false;
  globalStop = false;

  if (request.action === "delete_posts") {
    deletePosts(request.settings);
  } else if (request.action === "undo_retweets") {
    undoRetweets(request.settings);
  } else if (request.action === "undo_likes") {
    undoLikes(request.settings);
  } else if (request.action === "delete_replies") {
    deleteReplies(request.settings);
  } else if (request.action === "unfollow_non_followers") {
    unfollowNonFollowers(request.settings);
  }

  sendResponse({ status: "started" });
  return true;
});
