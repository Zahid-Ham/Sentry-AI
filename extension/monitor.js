const params = new URLSearchParams(window.location.search);
const streamId = params.get("streamId");
const SERVER_URL = "ws://localhost:8000/ws/user-session-1";

// Settings
const RECORD_INTERVAL = 5000; // 5 Seconds per analysis

let socket = null;
let mediaRecorder = null;
let audioContext = null;

// --- LOGGING ---
const logText = document.getElementById("logText");
function log(msg) {
  console.log(msg);
  if (logText) {
    logText.innerText = `>> ${msg}`;
    logText.style.opacity = 1;
  }
}

// --- 1. CONNECT ---
function connectSocket() {
  socket = new WebSocket(SERVER_URL);

  socket.onopen = () => {
    const statusText = document.getElementById("statusText");
    if (statusText) {
      statusText.innerText = "● PROTECTED CONNECTION";
      statusText.style.color = "#00f2ff";
    }
    log("Connected. Starting Audio Loop...");
    startRecordingLoop();
  };

  socket.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);

      // A. SHOW TRANSCRIPT (Visual Feedback)
      if (data.type === "TRANSCRIPT_SHOW") {
        log(`🗣️ Heard: "${data.text}"`);
      }

      // --- B. CRITICAL FIX: FORWARD VERDICT TO BACKGROUND ---
      if (data.type === "VERDICT") {
        console.log("⚡ Verdict Received:", data.payload);
        log(`⚡ Analysis: Score ${data.payload.threat_score}`);

        // Send this to background.js so it can open the popup
        chrome.runtime.sendMessage({
          type: "VERDICT",
          payload: data.payload,
        });
      }
    } catch (err) {
      console.error("Error parsing message:", err);
    }
  };

  socket.onclose = () => {
    log("⚠️ Disconnected from Brain");
    const statusText = document.getElementById("statusText");
    if (statusText) {
      statusText.innerText = "● DISCONNECTED";
      statusText.style.color = "red";
    }
  };
}

// --- 2. THE RECORDING LOOP ---
async function startRecordingLoop() {
  if (!mediaRecorder || mediaRecorder.state === "inactive") {
    try {
      mediaRecorder.start();
      log("Listening...");

      // Stop after 5 seconds (This forces a valid file creation)
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        }
      }, RECORD_INTERVAL);
    } catch (err) {
      console.error("Recorder Error:", err);
    }
  }
}

// --- 3. SETUP ---
async function startSentry() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: { chromeMediaSource: "tab", chromeMediaSourceId: streamId },
      },
      video: false,
    });

    // Loopback (Hear the audio)
    audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(audioContext.destination);

    // Setup Recorder
    mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });

    // When it stops, we get a FULL VALID FILE
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0 && socket?.readyState === WebSocket.OPEN) {
        // Send raw bytes to backend
        socket.send(e.data);
        log(`📡 Sent Packet (${e.data.size} bytes)`);
      }
    };

    // Immediately restart after sending
    mediaRecorder.onstop = () => {
      startRecordingLoop();
    };

    connectSocket();
  } catch (err) {
    log(`Error: ${err.message}`);
  }
}

if (streamId) {
  startSentry();
} else {
  log("❌ Critical Error: No Stream ID");
}
