// Delete Replies Action - NEW!
async function deleteReplies(settings) {
  try {
    console.log("🗨️ Starting delete replies with settings:", settings);
    sendProgress("Navigating to replies...", 0, 0, 0, 0);

    // Navigate to replies tab if not already there
    if (!window.location.pathname.includes("/with_replies")) {
      const username = window.location.pathname.split("/")[1];
      window.location.href = `https://x.com/${username}/with_replies`;
      await sleep(3000);
    }

    let stats = { processed: 0, success: 0, failed: 0 };
    let emptyScrollCount = 0;
    let consecutiveSkips = 0;

    while (stats.processed < settings.maxActions && emptyScrollCount < 5) {
      const tweets = Array.from(
        document.querySelectorAll('article[data-testid="tweet"]')
      );
      console.log(`Found ${tweets.length} tweets on page`);

      if (tweets.length === 0) {
        emptyScrollCount++;
        console.log(`No tweets found, empty count: ${emptyScrollCount}/5`);
        sendProgress(
          `Scrolling to find replies... (${emptyScrollCount}/5)`,
          stats.processed,
          settings.maxActions,
          stats.success,
          stats.failed
        );
        await scrollToLoad();
        await sleep(2000);
        continue;
      }

      emptyScrollCount = 0;

      // Process FIRST tweet only
      const tweet = tweets[0];
      console.log(`\n🎯 Processing reply ${stats.processed + 1}`);

      try {
        // Check pause/stop
        await checkPauseAndStop();

        // Check date filter
        if (settings.dateFrom || settings.dateTo) {
          const tweetDate = getTweetDate(tweet);
          if (!isDateInRange(tweetDate, settings.dateFrom, settings.dateTo)) {
            console.log("📅 Reply outside date range, skipping...");
            stats.processed++;
            await scrollToLoad();
            await sleep(500);
            continue;
          }
        }

        // Check if it's a reply (has "Membalas" or "Replying to")
        const tweetText = tweet.textContent.toLowerCase();
        const isReply =
          tweetText.includes("membalas") || tweetText.includes("replying to");

        if (!isReply) {
          console.log("⊝ Not a reply, skipping...");
          consecutiveSkips++;

          if (consecutiveSkips >= 5) {
            console.log("❌ Too many non-replies, stopping");
            break;
          }

          await scrollToLoad();
          await sleep(500);
          continue;
        }

        consecutiveSkips = 0;

        // Find and click MORE button
        const moreButton = tweet.querySelector('[data-testid="caret"]');

        if (!moreButton) {
          console.log("⚠️ No more button, scrolling...");
          await scrollToLoad();
          await sleep(1000);
          continue;
        }

        sendProgress(
          `📝 Opening menu for reply ${stats.processed + 1}...`,
          stats.processed,
          settings.maxActions,
          stats.success,
          stats.failed
        );
        console.log("✓ Found more button, clicking...");

        moreButton.click();
        await sleep(1000);

        // Find DELETE button
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
            console.log(`  ✓ Found DELETE button! (text: "${text}")`);
            break;
          }
        }

        if (!deleteButton) {
          console.log("❌ No delete button found");
          stats.failed++;
          stats.processed++;
          document.body.click();
          await sleep(500);
          sendProgress(
            `⊝ Skipped reply ${stats.processed} (can't delete)`,
            stats.processed,
            settings.maxActions,
            stats.success,
            stats.failed
          );
          continue;
        }

        // Click DELETE
        console.log("Clicking delete button...");
        deleteButton.click();
        await sleep(1500);

        // Find and click CONFIRM button
        console.log("Looking for confirmation button...");
        const confirmButton = document.querySelector(
          '[data-testid="confirmationSheetConfirm"]'
        );

        if (!confirmButton) {
          console.log("❌ Confirmation button not found!");
          stats.failed++;
          stats.processed++;
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

        // DRY RUN MODE
        if (settings.dryRun) {
          console.log("🧪 DRY RUN: Would delete this reply");
          stats.success++;
          stats.processed++;
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
          await sleep(1000);
        } else {
          // ACTUAL DELETE
          confirmButton.click();
          stats.success++;
          stats.processed++;

          logAction("delete_replies", "success", "", "Deleted reply");

          console.log(`✅ Successfully deleted reply ${stats.processed}!`);
          sendProgress(
            `✅ Deleted ${stats.success}/${stats.processed} replies`,
            stats.processed,
            settings.maxActions,
            stats.success,
            stats.failed
          );
          await sleep(2000);
        }

        // Check pause
        await checkPauseAndStop();

        // Delay
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

        await checkPauseAndStop();

        // Batch rest
        if (stats.processed % settings.batchSize === 0) {
          console.log(`\n💤 Batch rest after ${stats.processed} actions`);
          sendProgress(
            "💤 Taking 30s break...",
            stats.processed,
            settings.maxActions,
            stats.success,
            stats.failed
          );
          await sleep(30000);
        }

        // Save progress
        await saveProgress("delete_replies", stats, settings);
      } catch (err) {
        console.error("Error deleting reply:", err);
        stats.failed++;
        stats.processed++;
        sendProgress(
          `❌ Error on reply ${stats.processed}`,
          stats.processed,
          settings.maxActions,
          stats.success,
          stats.failed
        );
      }
    }

    // Final summary
    console.log("\n=== DELETE REPLIES COMPLETE ===");
    console.log(`Total processed: ${stats.processed}`);
    console.log(`Successful: ${stats.success}`);
    console.log(`Failed/Skipped: ${stats.failed}`);

    let stopReason = "";
    if (stats.processed >= settings.maxActions) {
      stopReason = "(reached max actions)";
    } else if (emptyScrollCount >= 5) {
      stopReason = "(no more posts found)";
    }

    await clearProgress();

    sendProgress(
      `🎉 Complete! Deleted ${stats.success} of ${stats.processed} replies ${stopReason}`,
      stats.processed,
      stats.processed,
      stats.success,
      stats.failed
    );
    await sleep(1000);
    sendComplete();
  } catch (error) {
    sendError(error.message);
  }
}

// Unfollow Non-Followers Action - NEW!
async function unfollowNonFollowers(settings) {
  try {
    console.log("👥 Starting unfollow non-followers with settings:", settings);
    sendProgress("Navigating to following page...", 0, 0, 0, 0);

    // Navigate to following page
    if (!window.location.pathname.includes("/following")) {
      const username = window.location.pathname.split("/")[1];
      window.location.href = `https://x.com/${username}/following`;
      await sleep(3000);
    }

    let stats = { processed: 0, success: 0, failed: 0 };
    let emptyScrollCount = 0;
    let checkedUsers = new Set();

    sendProgress("Analyzing followers...", 0, 0, 0, 0);

    while (stats.processed < settings.maxActions && emptyScrollCount < 5) {
      const userCells = Array.from(
        document.querySelectorAll('[data-testid="UserCell"]')
      );

      if (userCells.length === 0) {
        emptyScrollCount++;
        console.log(`No users found, empty count: ${emptyScrollCount}/5`);
        sendProgress(
          `Scrolling to find users... (${emptyScrollCount}/5)`,
          stats.processed,
          settings.maxActions,
          stats.success,
          stats.failed
        );
        await scrollToLoad();
        await sleep(2000);
        continue;
      }

      emptyScrollCount = 0;
      let foundNewUser = false;

      for (const userCell of userCells) {
        if (stats.processed >= settings.maxActions) break;

        try {
          // Check pause/stop
          await checkPauseAndStop();

          // Get username to avoid duplicates
          const usernameLink = userCell.querySelector('a[href^="/"]');
          if (!usernameLink) continue;

          const username = usernameLink.getAttribute("href").split("/")[1];

          if (checkedUsers.has(username)) {
            continue; // Already processed
          }

          checkedUsers.add(username);
          foundNewUser = true;

          // Check if "Follows you" text exists
          const followsYouText = userCell.textContent.toLowerCase();
          const isFollowingBack =
            followsYouText.includes("follows you") ||
            followsYouText.includes("mengikuti anda");

          if (isFollowingBack) {
            console.log(`✓ ${username} follows back, skipping`);
            continue; // Skip users who follow back
          }

          console.log(`👤 ${username} does not follow back`);

          // Find Following button (button yang sudah following)
          const followingButton = userCell.querySelector(
            '[data-testid*="follow"]'
          );

          if (!followingButton) {
            console.log(`⚠️ No button found for ${username}`);
            continue;
          }

          const buttonText = followingButton.textContent.toLowerCase();

          // Check if already following (button says "Following" or "Mengikuti")
          if (
            !buttonText.includes("following") &&
            !buttonText.includes("mengikuti")
          ) {
            console.log(`⊝ Not following ${username}, skipping`);
            continue;
          }

          // DRY RUN MODE
          if (settings.dryRun) {
            console.log(`🧪 DRY RUN: Would unfollow ${username}`);
            stats.success++;
            stats.processed++;
            sendProgress(
              `🧪 DRY RUN: Would unfollow ${stats.success}/${stats.processed}`,
              stats.processed,
              settings.maxActions,
              stats.success,
              stats.failed
            );
            await sleep(500);
          } else {
            // ACTUAL UNFOLLOW
            console.log(`🔴 Unfollowing ${username}...`);
            followingButton.click();
            await sleep(500);

            // Confirm unfollow if dialog appears
            const confirmButton = document.querySelector(
              '[data-testid="confirmationSheetConfirm"]'
            );
            if (confirmButton) {
              confirmButton.click();
              await sleep(500);
            }

            stats.success++;
            stats.processed++;

            logAction(
              "unfollow_non_followers",
              "success",
              `/@${username}`,
              `Unfollowed ${username}`
            );

            console.log(`✅ Unfollowed ${username}`);
            sendProgress(
              `✅ Unfollowed ${stats.success} non-followers`,
              stats.processed,
              settings.maxActions,
              stats.success,
              stats.failed
            );

            await sleep(
              randomDelay(settings.delay * 0.8, settings.delay * 1.2)
            );
          }

          // Check pause
          await checkPauseAndStop();

          // Batch rest
          if (stats.processed % settings.batchSize === 0) {
            console.log(`\n💤 Batch rest after ${stats.processed} unfollows`);
            sendProgress(
              "💤 Taking 30s break...",
              stats.processed,
              settings.maxActions,
              stats.success,
              stats.failed
            );
            await sleep(30000);
          }

          // Save progress
          await saveProgress("unfollow_non_followers", stats, settings);
        } catch (err) {
          console.error("Error unfollowing user:", err);
          stats.failed++;
          stats.processed++;
        }
      }

      // If no new users found, scroll
      if (!foundNewUser) {
        console.log("⚠️ No new users in current view");
        await scrollToLoad();
        await sleep(2000);
      }
    }

    // Final summary
    console.log("\n=== UNFOLLOW NON-FOLLOWERS COMPLETE ===");
    console.log(`Total processed: ${stats.processed}`);
    console.log(`Successful: ${stats.success}`);
    console.log(`Failed: ${stats.failed}`);

    let stopReason = "";
    if (stats.processed >= settings.maxActions) {
      stopReason = "(reached max actions)";
    } else if (emptyScrollCount >= 5) {
      stopReason = "(no more users found)";
    }

    await clearProgress();

    sendProgress(
      `🎉 Complete! Unfollowed ${stats.success} of ${stats.processed} non-followers ${stopReason}`,
      stats.processed,
      stats.processed,
      stats.success,
      stats.failed
    );
    await sleep(1000);
    sendComplete();
  } catch (error) {
    sendError(error.message);
  }
}
