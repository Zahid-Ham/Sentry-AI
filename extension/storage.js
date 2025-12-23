// extension/storage.js

// SAVE A NEW ALERT TO HISTORY
export async function saveAlert(data) {
  const { history } = await chrome.storage.local.get(["history"]);
  const newEntry = {
    id: Date.now(),
    timestamp: new Date().toLocaleString(),
    threat_score: data.threat_score,
    reason: data.reason,
    transcript: data.transcript || "No transcript available",
    screenshot: data.screenshot || null, // Base64 Image
  };

  const updatedHistory = history ? [newEntry, ...history] : [newEntry];

  // Limit to last 50 entries to save space
  if (updatedHistory.length > 50) updatedHistory.pop();

  await chrome.storage.local.set({ history: updatedHistory });
  console.log("💾 Alert Saved to History:", newEntry);
}

// GET ALL HISTORY
export async function getHistory() {
  const { history } = await chrome.storage.local.get(["history"]);
  return history || [];
}

// CLEAR HISTORY
export async function clearHistory() {
  await chrome.storage.local.set({ history: [] });
}
