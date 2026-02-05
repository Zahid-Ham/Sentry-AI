# 🎤 SentryAI - Hindi Speech Support Update

## What Changed?

We've completely redesigned SentryAI to use **Web Speech API** instead of raw audio streaming. This brings:

### ✅ Key Improvements:

1. **🇮🇳 Hindi Language Support**
   - Primary language: Hindi (hi-IN)
   - Fallback: English
   - Works with your laptop's native speech recognition

2. **🎤 Uses Your Laptop Microphone**
   - No more tab audio only
   - Works while watching YouTube, taking calls, etc.
   - Real-time transcription displayed live

3. **Live Transcript Display**
   - See the text being recognized in real-time
   - Shows both interim (while speaking) and final (after pause) transcription
   - Full conversation history in the monitor window

4. **Better Connection**
   - Single persistent WebSocket connection
   - No more repeated reconnection cycles
   - Sends text (lightweight) instead of audio chunks (heavy)

5. **Instant Threat Analysis**
   - As soon as you finish speaking, Groq analyzes the content
   - Shows threat score and reason
   - Captures evidence and alerts if threat detected

---

## How to Use:

### 1. **Reload the Extension**

```
Chrome → Extensions → SentryAI → Reload
```

### 2. **Open YouTube or Any Website**

- Play a video or audio content
- Open SentryAI Monitor (extension popup)

### 3. **Click "Start Listening"**

- Give microphone permission when prompted
- Monitor window will show: "🎤 Listening (Hindi/English)..."

### 4. **Speak in Hindi or English**

- The extension will transcribe in real-time
- Shows "🗣️ Heard: [your words]"
- After you pause, Groq analyzes for fraud

### 5. **If Threat Detected**

- Alert popup appears with threat score
- Screenshot and details saved to Evidence Log
- You can report if needed

---

## Technical Details:

### What's Different in Code:

**Before (Main_Simple.py):**

- Received binary audio chunks from extension
- Tried to convert WebM → WAV
- Sent placeholder text "Audio received and processing..."
- This caused the 1001 WebSocket errors!

**Now (Updated Main_Simple.py):**

- Receives JSON text messages from Web Speech API
- Format: `{"type": "ANALYZE_TEXT", "text": "user's transcript"}`
- Directly sends to Groq for analysis
- Much lighter and more reliable

### Extension Changes (Monitor.js):

**Before:**

```javascript
mediaRecorder.start() → 5 sec → mediaRecorder.stop()
→ Send binary audio → CLOSE CONNECTION → Reconnect
```

**Now:**

```javascript
SpeechRecognition.start() → Listen continuously
→ User speaks → Transcribe to text
→ Send JSON with transcript → Groq analyzes
→ Keep connection open → Ready for next phrase
```

---

## Browser Compatibility:

✅ **Works Best In:**

- Chrome (latest)
- Edge (latest)
- Samsung Internet
- Firefox (with flag enabled)

⚠️ **Requires:**

- HTTPS or localhost
- Microphone permission
- Internet connection

---

## Troubleshooting:

### "Speech Recognition not supported"

→ Use Chrome, Edge, or Firefox

### No transcription appearing

→ Check browser microphone permissions
→ Try speaking louder/closer to mic

### Getting wrong language

→ Set your system language to Hindi if available
→ Or repeat in clear English

### Still not working?

→ Open DevTools (F12) → Console tab
→ Look for error messages
→ Copy the error and report

---

## What About the Backend?

Railway automatically deployed your latest code! ✅

The backend now:

- Accepts text transcripts (not audio bytes)
- Supports backward compatibility for old format
- Analyzes with Groq LLM in real-time
- Sends verdicts back to extension

Check logs at: https://railway.app → Your Project → Logs

---

## Next Steps:

1. **Test with Hindi content**
   - Play a scam call recording in Hindi
   - Or speak in Hindi to test

2. **Verify threat detection works**
   - If it detects threats properly, you're golden!
   - If false positives/negatives, we can adjust

3. **Check Evidence Log**
   - Popup → Evidence Log tab
   - See all detected threats with screenshots

4. **Report Issues**
   - Check console for errors (F12)
   - Include exact error message in report

---

**Status:** ✅ Production Ready  
**Deployment:** Railway.app (auto-updated)  
**GitHub:** https://github.com/Zahid-Ham/Sentry-AI

Commit: `0c2697f` - Switch to Web Speech API: Support Hindi/English transcription
