# 🛡️ SentryAI: Real-Time Digital Arrest Scam Detector

![Python](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python-blue)
![Extension](https://img.shields.io/badge/Frontend-Chrome%20Extension-yellow)
![AI](https://img.shields.io/badge/AI-Groq%20%2B%20Vosk-orange)

> **"Digital Arrest" ends here.**
> SentryAI acts as a guardian layer over your browser, analyzing real-time audio from video calls to detect scam patterns and alert victims instantly.

---

## 🚨 The Problem: "Digital Arrest"

Cybercriminals in India and abroad are using sophisticated psychological tactics, impersonating Police, CBI, or Customs officials via video calls (Skype/WhatsApp/Zoom) to extort money. These "Digital Arrest" scams rely on fear and isolation. Victims are often too panicked to realize they are being conned.

## 💡 The Solution

SentryAI is a privacy-first browser extension that listens to audio during calls. It uses a **Hybrid AI Architecture** to detect threats without sending private audio to the cloud.

### Key Features

- **🕵️ Real-Time Monitoring:** Continuously analyzes audio streams every 3 seconds.
- **⚡ Instant Red Alerts:** Visual and Audio alarms trigger the moment a threat is detected (e.g., "Money Demand", "Police Impersonation").
- **🗣️ Hinglish Support:** Capable of understanding mixed Hindi-English conversations common in Indian cyber scams.
- **📄 Automated Evidence Dossier:** Generates an official **Police Complaint Report (PDF)** with timestamps, transcripts, and suspect screenshots automatically.
- **🔒 Privacy First:** Audio is processed in RAM and discarded. No conversations are stored on external servers.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (Chrome Extension API)
- **Backend:** Python, FastAPI, WebSockets
- **AI Engine (Hybrid):**
  - **Offline:** Vosk (Kaldi) for real-time Speech-to-Text.
  - **Cloud:** Groq (Llama 3) for high-speed Contextual Threat Analysis.
- **Audio Processing:** FFmpeg (Direct Subprocess)

---

## 📂 Project Structure

```text
SentryAI_Project/
├── backend/                # The Brain (Python + AI)
│   ├── model/              # Offline Vosk AI Model (Download Required)
│   ├── main.py             # FastAPI Server Entry Point
│   ├── ffmpeg.exe          # Audio Processing Binary
│   └── .env                # API Keys (Not uploaded)
├── extension/              # The Eyes & Ears (Chrome Ext)
│   ├── manifest.json       # Extension Config
│   ├── monitor.js          # Audio Capture Logic
│   └── popup.html          # User Interface
└── requirements.txt        # Dependencies

```

---

## 🚀 Installation Guide

### Option 1: For End Users (No Coding Required)

**1. Download the Application:**
   - Get the `SentryAI_Server.zip` from your provider.
   - Extract/Unzip it to a folder on your Desktop.

**2. Run the Backend:**
   - Open the folder and double-click `SentryAI_Server.exe`.
   - A window will appear saying "SentryAI Server running...". Keep this open.

**3. Install the Extension:**
   - Open Chrome -> `chrome://extensions`.
   - Turn on **Developer Mode** (top right).
   - Click **"Load Unpacked"** and select the `extension` folder included in the download.

**That's it!** The icon will turn blue/green when connected.

---

### Option 2: For Developers (Source Code)

Follow these steps to set up the project locally.

### Prerequisites

- Python 3.8+
- Google Chrome / Brave / Edge

### Step 1: Setup the Backend

1.  **Clone the Repository:**

    ```bash
    git clone [https://github.com/YOUR_USERNAME/SentryAI.git](https://github.com/YOUR_USERNAME/SentryAI.git)
    cd SentryAI/backend
    ```

2.  **Install Dependencies:**

    ```bash
    pip install -r requirements.txt
    ```

3.  **Download Necessary Binaries (Critical Step):**

    - **AI Model:** Download the [Vosk Small Hindi Model](https://alphacephei.com/vosk/models/vosk-model-small-hi-0.22.zip). Unzip it and rename the extracted folder to `model`. Place it inside the `backend/` directory.
    - **FFmpeg:** Download [FFmpeg Essentials](https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip). Extract `ffmpeg.exe` and `ffprobe.exe` from the `bin` folder and place them inside the `backend/` directory.

4.  **Configure API Keys:**

    - Create a file named `.env` in the `backend/` folder.
    - Add your Groq API Key (Get one from console.groq.com):
      ```ini
      GROQ_API_KEY=gsk_your_key_here
      ```

5.  **Run the Server:**
    ```bash
    uvicorn main:app --reload
    ```
    _You should see: `✅ AI Model Loaded!`_

### Step 2: Load the Extension

1.  Open Chrome and go to `chrome://extensions`.
2.  Enable **Developer Mode** (top right toggle).
3.  Click **"Load Unpacked"**.
4.  Select the `extension/` folder from this project.
5.  Pin the 🛡️ SentryAI icon to your toolbar.

---

## 📖 How to Test

1.  Ensure the backend server is running.
2.  Open a YouTube video containing a sample scam call (or use a test script).
3.  Click the **SentryAI Shield Icon** -> **"INITIALIZE INTERCEPTOR"**.
4.  Watch the logs in your terminal. When the AI detects a threat (e.g., "Arrest", "RBI", "Money"), the extension will trigger a **RED ALERT** popup.

---

## ❤️ Credits

**Developed with ❤️ by Zahid Hamdule**
_Building safer digital spaces for everyone._
