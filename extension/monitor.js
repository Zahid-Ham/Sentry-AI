const params = new URLSearchParams(window.location.search);
const streamId = params.get("streamId");
const SERVER_URL = "ws://localhost:8000/ws/user-session-1";

// 3 Seconds = Faster detection, valid files, no backend errors
const RECORD_INTERVAL = 3000;

let socket = null;
let mediaRecorder = null;
let globalStream = null;
let currentTranscript = "";

// --- LOGGING ---
const logText = document.getElementById("logText");
function log(msg) {
  console.log(msg);
  if (logText) {
    logText.innerText = `>> ${msg}`;
    logText.style.opacity = 1;
  }
}

// --- 1. CONNECT TO BRAIN ---
function connectSocket() {
  socket = new WebSocket(SERVER_URL);

  socket.onopen = () => {
    document.getElementById("statusText").innerText = "● PROTECTED CONNECTION";
    document.getElementById("statusText").style.color = "#00f2ff";
    log("Connected. Protection Active.");
    startRecordingLoop(); // Start the loop
  };

  socket.onmessage = (e) => {
    try {
      const data = JSON.parse(e.data);

      // A. LIVE TRANSCRIPT
      if (data.type === "TRANSCRIPT_SHOW") {
        currentTranscript = data.text;
        log(`🗣️ Heard: "${data.text}"`);
      }

      // B. THREAT VERDICT
      if (data.type === "VERDICT") {
        const analysis = data.payload;

        if (analysis.threat_score > 5 || analysis.is_threat === true) {
          console.log("🚨 THREAT DETECTED!");

          // CAPTURE EVIDENCE & ALERT IMMEDIATELY
          captureEvidence(async (screenshotUrl) => {
            // 1. SAVE TO HISTORY
            const newEntry = {
              id: Date.now(),
              timestamp: new Date().toLocaleString(),
              threat_score: analysis.threat_score,
              reason: analysis.reason,
              transcript: currentTranscript || "Audio Detected",
              screenshot: screenshotUrl,
            };

            const { history } = await chrome.storage.local.get(["history"]);
            // Add new entry to top of list
            const updated = [newEntry, ...(history || [])].slice(0, 50);
            await chrome.storage.local.set({ history: updated });

            // 2. OPEN POPUP INSTANTLY
            const popupUrl =
              chrome.runtime.getURL("popup.html") +
              `?alert=true&score=${
                analysis.threat_score
              }&reason=${encodeURIComponent(analysis.reason)}`;

            chrome.windows.create({
              url: popupUrl,
              type: "popup",
              width: 380,
              height: 540,
              focused: true,
            });
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };
}

// --- 2. THE STABLE LOOP (Critical Fix) ---
async function startRecordingLoop() {
  if (!mediaRecorder || mediaRecorder.state === "inactive") {
    try {
      // Start recording a NEW file (this creates a valid header every time)
      mediaRecorder.start();
      log("Listening...");

      // Stop after 3 seconds to send the file
      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        }
      }, RECORD_INTERVAL);
    } catch (err) {
      console.error(err);
    }
  }
}

// --- 3. STARTUP ---
async function startSentry() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: { chromeMediaSource: "tab", chromeMediaSourceId: streamId },
      },
      video: {
        mandatory: { chromeMediaSource: "tab", chromeMediaSourceId: streamId },
      },
    });
    globalStream = stream;

    // Play audio locally
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(audioContext.destination);

    // Setup Recorder
    const audioStream = new MediaStream(stream.getAudioTracks());
    mediaRecorder = new MediaRecorder(audioStream, { mimeType: "audio/webm" });

    // When recorder stops (every 3s), send data and RESTART
    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0 && socket?.readyState === WebSocket.OPEN) {
        socket.send(e.data); // Valid file sent to backend
      }
    };

    mediaRecorder.onstop = () => {
      // Immediately restart to catch the next sentence
      startRecordingLoop();
    };

    connectSocket();
  } catch (err) {
    log(`Error: ${err.message}`);
  }
}

if (streamId) startSentry();

// --- HELPER: SCREENSHOT ---
function captureEvidence(callback) {
  if (!globalStream || globalStream.getVideoTracks().length === 0) {
    callback(null);
    return;
  }
  const imageCapture = new ImageCapture(globalStream.getVideoTracks()[0]);
  imageCapture
    .grabFrame()
    .then((bitmap) => {
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      canvas.getContext("2d").drawImage(bitmap, 0, 0);
      callback(canvas.toDataURL("image/jpeg", 0.7));
    })
    .catch(() => callback(null));
}
