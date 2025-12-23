// extension/content.js

console.log("✅ SentryAI Content Script Loaded");

// 1. Listen for messages from background.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "SHOW_WARNING") {
    console.log("⚠️ SHOWING WARNING OVERLAY...");
    showRedScreen(request.reason);
  }
});

// 2. The Visual Warning Function (Your Custom Design)
function showRedScreen(reason) {
  // Prevent duplicate overlays
  if (document.getElementById("sentry-overlay")) return;

  // A. Inject CSS for the font
  const style = document.createElement("style");
  style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;700&display=swap');
        .sentry-btn-hover:hover { background: rgba(255, 0, 85, 0.2) !important; box-shadow: 0 0 20px rgba(255, 0, 85, 0.6); }
        @keyframes sentryFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes sentryShake { 
            0% { transform: translate(1px, 1px) rotate(0deg); }
            10% { transform: translate(-1px, -2px) rotate(-1deg); }
            20% { transform: translate(-3px, 0px) rotate(1deg); }
            30% { transform: translate(3px, 2px) rotate(0deg); }
            40% { transform: translate(1px, -1px) rotate(1deg); }
            50% { transform: translate(-1px, 2px) rotate(-1deg); }
            60% { transform: translate(-3px, 1px) rotate(0deg); }
            70% { transform: translate(3px, 1px) rotate(-1deg); }
            80% { transform: translate(-1px, -1px) rotate(1deg); }
            90% { transform: translate(1px, 2px) rotate(0deg); }
            100% { transform: translate(1px, -2px) rotate(-1deg); }
        }
    `;
  document.head.appendChild(style);

  const div = document.createElement("div");
  div.id = "sentry-overlay";

  // B. Glassmorphism Dark UI
  div.innerHTML = `
        <div style="
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(10, 10, 15, 0.95); backdrop-filter: blur(15px);
            z-index: 2147483647; display: flex; flex-direction: column;
            justify-content: center; align-items: center; font-family: 'Chakra Petch', sans-serif;
            color: white; animation: sentryFadeIn 0.3s ease-out;
        ">
            <div style="
                width: 600px; padding: 40px; border: 1px solid rgba(255, 0, 85, 0.3);
                background: linear-gradient(180deg, rgba(20, 0, 5, 0.8) 0%, rgba(40, 0, 10, 0.8) 100%);
                box-shadow: 0 0 50px rgba(255, 0, 85, 0.4); border-radius: 16px; text-align: center;
            ">
                <div style="font-size: 60px; margin-bottom: 20px; animation: sentryShake 0.5s;">🚨</div>
                <h1 style="color: #ff0055; font-size: 32px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 2px;">
                    Critical Threat Blocked
                </h1>
                <p style="color: #ffcccc; font-size: 18px; margin-bottom: 30px; line-height: 1.5;">
                    SentryAI has detected a high-probability <strong>Digital Arrest Fraud</strong> attempt.<br>
                    <span style="color: #aaa; font-size: 14px; margin-top: 10px; display: block;">Reason: ${reason}</span>
                </p>
                
                <div style="display: flex; justify-content: center; gap: 15px;">
                    <button id="sentry-ignore-btn" class="sentry-btn-hover" style="
                        padding: 12px 25px; background: transparent; border: 2px solid #ff0055;
                        color: #ff0055; font-weight: bold; font-family: inherit; cursor: pointer;
                        border-radius: 6px; transition: all 0.2s;
                    ">
                        IGNORE RISK
                    </button>
                    <button id="sentry-terminate-btn" style="
                        padding: 12px 25px; background: #ff0055; border: none;
                        color: white; font-weight: bold; font-family: inherit; cursor: pointer;
                        border-radius: 6px; box-shadow: 0 0 20px rgba(255, 0, 85, 0.4);
                    ">
                        TERMINATE CALL
                    </button>
                </div>
            </div>
        </div>
    `;
  document.body.appendChild(div);

  // C. Add Functionality (Replaces inline onclick)
  document.getElementById("sentry-ignore-btn").addEventListener("click", () => {
    document.getElementById("sentry-overlay").remove();
  });

  document
    .getElementById("sentry-terminate-btn")
    .addEventListener("click", () => {
      // Stops the video and reloads the page
      const video = document.querySelector("video");
      if (video) video.pause();
      window.location.reload();
    });

  // D. Play Alarm Sound
  const audio = new Audio(
    "https://actions.google.com/sounds/v1/alarms/beep_short.ogg"
  );
  audio.play().catch((e) => console.log("Audio autoplay blocked"));
}
