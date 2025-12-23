// extension/background.js
console.log("✅ SentryAI Service Worker STARTED");

let monitorWindowId = null;

// The Background Script now acts as the "Enforcer"
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // --- A. START COMMAND ---
  if (message.type === "START_SENTRY") {
    console.log("🟢 Starting Monitor...");

    // 1. Get Stream ID from Tab
    chrome.tabCapture.getMediaStreamId(
      { targetTabId: message.tabId },
      (streamId) => {
        if (chrome.runtime.lastError) {
          console.error("Capture failed:", chrome.runtime.lastError.message);
          return;
        }

        // 2. Open Monitor Window (This file now handles the WebSocket)
        chrome.windows.create(
          {
            url: `monitor.html?streamId=${streamId}`,
            type: "popup",
            width: 400,
            height: 300,
            focused: true,
          },
          (win) => {
            monitorWindowId = win.id;
          }
        );
      }
    );
  }

  // --- B. STOP COMMAND ---
  if (message.type === "STOP_SENTRY") {
    console.log("🔴 Stopping...");
    if (monitorWindowId) {
      chrome.windows.remove(monitorWindowId).catch(() => {});
      monitorWindowId = null;
    }
  }

  // --- C. CRITICAL: RECEIVE VERDICT FROM MONITOR & OPEN POPUP ---
  if (message.type === "VERDICT") {
    const analysis = message.payload;
    console.log("📨 Background Received Verdict Score:", analysis.threat_score);

    // TRIGGER LOGIC
    if (analysis.threat_score > 5 || analysis.is_threat === true) {
      console.log("🚨 THREAT CONFIRMED! Launching Alert...");

      // 1. First, try sending to the extension popup if it is currently open
      chrome.runtime
        .sendMessage({
          type: "SCAM_ALERT",
          payload: analysis,
        })
        .catch(() => {
          // 2. FALLBACK: If popup is closed, FORCE OPEN A NEW WINDOW
          console.log("⚠️ UI Closed. Forcing Window Open...");

          const alertUrl =
            chrome.runtime.getURL("popup.html") +
            `?alert=true&score=${
              analysis.threat_score
            }&reason=${encodeURIComponent(analysis.reason)}`;

          chrome.windows.create({
            url: alertUrl,
            type: "popup",
            width: 380,
            height: 540,
            focused: true,
            state: "normal",
          });
        });
    }
  }
});
