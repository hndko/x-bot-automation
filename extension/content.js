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
  chrome.runtime.sendMessage({
    type: "progress",
    data: {
      message,
      processed,
      total,
      success,
      failed,
    },
  });
}

// Send completion message
function sendComplete() {
  chrome.runtime.sendMessage({ type: "complete" });
}

// Send error message
function sendError(message) {
  chrome.runtime.sendMessage({
    type: "error",
    message,
  });
}

// Delete Posts Action
async function deletePosts(settings) {
  try {
    sendProgress("Navigating to profile...", 0, 0, 0, 0);

    // Get username from page
    const usernameElement = document.querySelector('[data-testid="UserName"]');
    if (!usernameElement) {
      throw new Error(
        "Could not find username. Please go to your profile page."
      );
    }

    // Navigate to own profile if not already there
    if (
      !window.location.pathname.includes("/") ||
      window.location.pathname === "/home"
    ) {
      const profileLink = document.querySelector('a[href*="/"]');
      if (profileLink) {
        profileLink.click();
        await sleep(3000);
      }
    }

    let stats = { processed: 0, success: 0, failed: 0 };
    let consecutiveNoNew = 0;

    while (stats.processed < settings.maxActions && consecutiveNoNew < 3) {
      // Find all tweet articles
      const tweets = document.querySelectorAll('article[data-testid="tweet"]');

      if (tweets.length === 0) {
        consecutiveNoNew++;
        await scrollToLoad();
        continue;
      }

      sendProgress(
        `Found ${tweets.length} posts. Processing...`,
        stats.processed,
        settings.maxActions,
        stats.success,
        stats.failed
      );

      for (const tweet of tweets) {
        if (stats.processed >= settings.maxActions) break;

        try {
          // Find more button (three dots)
          const moreButton = tweet.querySelector('[data-testid="caret"]');
          if (!moreButton) continue;

          // Click more button
          moreButton.click();
          await sleep(500);

          // Find delete option
          const deleteButton = document.querySelector(
            '[data-testid="Dropdown"] [role="menuitem"]'
          );
          if (
            deleteButton &&
            deleteButton.textContent.toLowerCase().includes("delete")
          ) {
            deleteButton.click();
            await sleep(500);

            // Confirm delete
            const confirmButton = document.querySelector(
              '[data-testid="confirmationSheetConfirm"]'
            );
            if (confirmButton) {
              confirmButton.click();
              stats.success++;
              await sleep(
                randomDelay(settings.delay * 0.8, settings.delay * 1.2)
              );
            }
          } else {
            // Close menu if no delete option
            document.body.click();
            await sleep(200);
          }

          stats.processed++;
          sendProgress(
            `Deleted ${stats.success} posts...`,
            stats.processed,
            settings.maxActions,
            stats.success,
            stats.failed
          );

          // Batch rest
          if (stats.processed % settings.batchSize === 0) {
            sendProgress(
              "Taking a break...",
              stats.processed,
              settings.maxActions,
              stats.success,
              stats.failed
            );
            await sleep(30000); // 30 second break
          }
        } catch (err) {
          stats.failed++;
          console.error("Error deleting tweet:", err);
        }
      }

      // Scroll to load more
      await scrollToLoad();
      consecutiveNoNew = tweets.length === 0 ? consecutiveNoNew + 1 : 0;
    }

    sendProgress(
      `✅ Complete! Deleted ${stats.success} posts.`,
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

// Undo Retweets Action
async function undoRetweets(settings) {
  try {
    sendProgress("Looking for retweets...", 0, 0, 0, 0);

    let stats = { processed: 0, success: 0, failed: 0 };
    let consecutiveNoNew = 0;

    while (stats.processed < settings.maxActions && consecutiveNoNew < 3) {
      // Find all retweeted posts
      const tweets = document.querySelectorAll('article[data-testid="tweet"]');

      for (const tweet of tweets) {
        if (stats.processed >= settings.maxActions) break;

        try {
          // Look for unretweet button
          const unretweetButton = tweet.querySelector(
            '[data-testid="unretweet"]'
          );

          if (unretweetButton) {
            unretweetButton.click();
            await sleep(500);

            // Confirm unretweet
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

            // Batch rest
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

    // Navigate to likes page if not already there
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
          // Look for unlike button
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

            // Batch rest
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
    sendResponse({ status: "ready" });
    return true;
  }

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
