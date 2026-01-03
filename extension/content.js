// Content Script - Runs on Twitter/X pages
console.log("X Bot Helper: Content script loaded");

// Helper function: sleep/delay
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

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
          continue;
        }

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

    sendProgress(
      `🎉 Complete! Deleted ${stats.success} of ${stats.processed} posts`,
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
    let consecutiveNoNew = 0;

    while (stats.processed < settings.maxActions && consecutiveNoNew < 3) {
      const tweets = document.querySelectorAll('article[data-testid="tweet"]');

      for (const tweet of tweets) {
        if (stats.processed >= settings.maxActions) break;

        try {
          const unretweetButton = tweet.querySelector(
            '[data-testid="unretweet"]'
          );

          if (unretweetButton) {
            unretweetButton.click();
            await sleep(500);

            const confirmButton = document.querySelector(
              '[data-testid="unretweetConfirm"]'
            );
            if (confirmButton) {
              confirmButton.click();
              stats.success++;
              await sleep(
                randomDelay(settings.delay * 0.8, settings.delay * 1.2)
              );
            }

            stats.processed++;
            sendProgress(
              `Undone ${stats.success} retweets...`,
              stats.processed,
              settings.maxActions,
              stats.success,
              stats.failed
            );

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
          }
        } catch (err) {
          stats.failed++;
          console.error("Error undoing retweet:", err);
        }
      }

      await scrollToLoad();
      consecutiveNoNew = tweets.length === 0 ? consecutiveNoNew + 1 : 0;
    }

    sendProgress(
      `✅ Complete! Undone ${stats.success} retweets.`,
      stats.processed,
      stats.processed,
      stats.success,
      stats.failed
    );
    sendComplete();
  } catch (error) {
    sendError(error.message);
  }
}

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
    let consecutiveNoNew = 0;

    while (stats.processed < settings.maxActions && consecutiveNoNew < 3) {
      const tweets = document.querySelectorAll('article[data-testid="tweet"]');

      for (const tweet of tweets) {
        if (stats.processed >= settings.maxActions) break;

        try {
          const unlikeButton = tweet.querySelector('[data-testid="unlike"]');

          if (unlikeButton) {
            unlikeButton.click();
            stats.success++;
            await sleep(
              randomDelay(settings.delay * 0.8, settings.delay * 1.2)
            );

            stats.processed++;
            sendProgress(
              `Unliked ${stats.success} tweets...`,
              stats.processed,
              settings.maxActions,
              stats.success,
              stats.failed
            );

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
          }
        } catch (err) {
          stats.failed++;
          console.error("Error unliking tweet:", err);
        }
      }

      await scrollToLoad();
      consecutiveNoNew = tweets.length === 0 ? consecutiveNoNew + 1 : 0;
    }

    sendProgress(
      `✅ Complete! Unliked ${stats.success} tweets.`,
      stats.processed,
      stats.processed,
      stats.success,
      stats.failed
    );
    sendComplete();
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

  if (request.action === "delete_posts") {
    deletePosts(request.settings);
  } else if (request.action === "undo_retweets") {
    undoRetweets(request.settings);
  } else if (request.action === "undo_likes") {
    undoLikes(request.settings);
  }

  sendResponse({ status: "started" });
  return true;
});
