// extension/offscreen.js

chrome.runtime.onMessage.addListener(async (msg) => {
  if (msg.type === "START_RECORDING") {
    startListening(msg.streamId);
  }
});

async function startListening(streamId) {
  try {
    console.log("🎤 Starting Capture with Stream ID:", streamId);

    // 1. Capture the Tab Audio
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: "tab",
          chromeMediaSourceId: streamId,
        },
      },
      video: false,
    });

    // 2. [AUDIO FIX] Unmute the audio by playing it back
    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(audioContext.destination);

    // 3. Setup Speech Recognition
    const recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "hi-IN"; // Supports Hindi + English

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          transcript += event.results[i][0].transcript;
        }
      }

      // 4. Send the text to Background.js (so you can see it in the Service Worker Console)
      if (transcript.length > 0) {
        chrome.runtime.sendMessage({
          type: "TRANSCRIPT_UPDATE",
          text: transcript,
        });
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech Error:", event.error);
      // If not-allowed, it means the Setup Page wasn't used properly
      if (event.error === "not-allowed") {
        chrome.runtime.sendMessage({
          type: "ERROR",
          message: "Microphone permission denied",
        });
      }
    };

    recognition.start();
    console.log("✅ SentryAI Audio Active (Hinglish + Unmuted)");
  } catch (err) {
    console.error("❌ Audio Capture Failed:", err.name, err.message);
  }
}
