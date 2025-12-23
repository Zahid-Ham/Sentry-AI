// extension/popup.js

// Global variable to control the sound
let alarmSound = null;

document.addEventListener("DOMContentLoaded", async () => {
  // --- 0. AUTO-OPEN CHECK (If background opened this window) ---
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("alert")) {
    showRedAlert({
      threat_score: urlParams.get("score"),
      reason: urlParams.get("reason"),
    });
  }

  // --- 1. CLOSE BUTTON ---
  const closeBtn = document.getElementById("close-popup");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      stopAlarm(); // Stop sound if closed
      window.close();
    });
  }

  // --- 2. RESTORE STATE ---
  const { isScanning } = await chrome.storage.local.get(["isScanning"]);
  if (isScanning && !urlParams.has("alert")) {
    setVisualState(true);
  }

  // --- 3. START BUTTON ---
  document.getElementById("start-btn").addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });

    if (!tab) {
      alert("Please open this on a YouTube tab!");
      return;
    }

    console.log("🚀 Sending Start Command for Tab:", tab.id);
    chrome.runtime.sendMessage({ type: "START_SENTRY", tabId: tab.id });

    await chrome.storage.local.set({ isScanning: true });
    setVisualState(true);
  });

  // --- 4. STOP BUTTON ---
  document.getElementById("stop-btn").addEventListener("click", async () => {
    chrome.runtime.sendMessage({ type: "STOP_SENTRY" });
    await chrome.storage.local.set({ isScanning: false });
    setVisualState(false);
  });

  // --- 5. LISTEN FOR ALERTS ---
  chrome.runtime.onMessage.addListener((request) => {
    if (request.type === "SCAM_ALERT") {
      showRedAlert(request.payload);
    }
  });

  // --- 6. DISMISS ALERT (Stops Sound) ---
  document.getElementById("reset-btn").addEventListener("click", () => {
    stopAlarm(); // <--- STOP THE BEEP
    document.getElementById("alert-ui").style.display = "none";
    document.getElementById("normal-ui").style.display = "flex";

    // If this was an auto-popup, close the window entirely
    if (urlParams.has("alert")) {
      window.close();
    }
  });
});

// --- VISUAL HELPERS ---
function setVisualState(active) {
  if (active) {
    document.getElementById("shieldContainer").classList.add("pulse-active");
    document.getElementById("statusText").innerText = "ACTIVE SCANNING";
    document.getElementById("statusText").style.color = "#00f2ff";
    document.getElementById("start-btn").style.display = "none";
    document.getElementById("stop-btn").style.display = "block";
  } else {
    document.getElementById("shieldContainer").classList.remove("pulse-active");
    document.getElementById("statusText").innerText = "SYSTEM IDLE";
    document.getElementById("statusText").style.color = "#ffffff";
    document.getElementById("start-btn").style.display = "block";
    document.getElementById("stop-btn").style.display = "none";
  }
}

function showRedAlert(data) {
  document.getElementById("normal-ui").style.display = "none";
  document.getElementById("alert-ui").style.display = "flex";
  document.getElementById("score-val").innerText = data.threat_score || "99";
  document.getElementById("alert-reason").innerText =
    data.reason || "Fraud detected.";

  // --- PLAY ALARM SOUND ---
  playAlarm();
}

// --- SOUND LOGIC ---
function playAlarm() {
  if (!alarmSound) {
    // Use a reliable generic alarm sound
    alarmSound = new Audio(
      "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
    );
    alarmSound.loop = true; // Loop it until dismissed
    alarmSound.volume = 0.5; // Set volume (0.0 to 1.0)
  }

  // Attempt to play (Browsers sometimes block autoplay without interaction)
  alarmSound.play().catch((error) => {
    console.log("Audio Autoplay blocked by browser:", error);
  });
}

function stopAlarm() {
  if (alarmSound) {
    alarmSound.pause();
    alarmSound.currentTime = 0; // Reset to start
    alarmSound = null;
  }
}
