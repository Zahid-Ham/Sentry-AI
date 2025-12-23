import os
import sys
import json
import subprocess
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from groq_client import GroqClient
from vosk import Model, KaldiRecognizer, SetLogLevel

# --- 1. SETUP & CONFIG ---
load_dotenv()
SetLogLevel(-1) # Hide Vosk logs

# Securely get API Key
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("❌ ERROR: GROQ_API_KEY not found in .env!")
    # We don't exit here so the .exe doesn't crash immediately, 
    # but the AI features won't work.

# --- 2. FIND RESOURCES (FFMPEG & MODEL) ---
# This helper function finds files whether we are in VS Code OR inside the .exe
def get_resource_path(relative_path):
    if hasattr(sys, '_MEIPASS'):
        # We are running inside the .exe
        return os.path.join(sys._MEIPASS, relative_path)
    # We are running in VS Code
    return os.path.join(os.path.abspath("."), relative_path)

FFMPEG_PATH = get_resource_path("ffmpeg.exe")
MODEL_PATH = get_resource_path("model")

# Check Model
if not os.path.exists(MODEL_PATH):
    print(f"❌ ERROR: Model not found at {MODEL_PATH}")
    sys.exit(1)

print("🚀 Loading AI Model... (This may take a moment)")
vosk_model = Model(MODEL_PATH)
print("✅ AI Model Loaded!")

# --- 3. INIT CLIENTS ---
app = FastAPI()
groq_client = GroqClient(GROQ_API_KEY)

# --- 4. HELPER: CONVERT AUDIO (NO PYDUB) ---
def convert_webm_to_wav(webm_data):
    """
    Uses FFMPEG directly to convert WebM audio chunks to 16kHz Mono WAV
    required by Vosk. No pydub/audioop required.
    """
    try:
        command = [
            FFMPEG_PATH,
            '-i', 'pipe:0',      # Read input from memory
            '-f', 'wav',         # Output format
            '-ac', '1',          # Channels: 1 (Mono)
            '-ar', '16000',      # Rate: 16000Hz
            '-v', 'quiet',       # Hide logs
            'pipe:1'             # Write output to memory
        ]
        
        # Run FFMPEG process
        process = subprocess.Popen(
            command,
            stdin=subprocess.PIPE, 
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Send data and get result
        wav_data, _ = process.communicate(input=webm_data)
        return wav_data
    except Exception as e:
        print(f"⚠️ Audio Conversion Error: {e}")
        return None

# --- 5. WEBSOCKET ENDPOINT ---
@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    print(f"✅ Client {client_id} Connected")
    
    # Create a recognizer for this specific session
    rec = KaldiRecognizer(vosk_model, 16000)
    
    try:
        while True:
            # 1. Receive Audio Chunk (WebM)
            data = await websocket.receive_bytes()
            
            # 2. Convert to WAV (Using direct FFMPEG)
            wav_data = convert_webm_to_wav(data)
            
            if wav_data:
                # 3. Process with Vosk (Offline AI)
                if rec.AcceptWaveform(wav_data):
                    result = json.loads(rec.Result())
                    text = result.get("text", "")
                    
                    if text:
                        print(f"🗣️ Heard: {text}")
                        # Send transcript to UI
                        await websocket.send_json({"type": "TRANSCRIPT_SHOW", "text": text})
                        
                        # 4. Analyze with Groq (Cloud AI)
                        print("🤔 Analyzing...")
                        verdict = await groq_client.analyze_text(text)
                        print(f"⚡ Verdict: {verdict}")
                        
                        # Send verdict to UI
                        await websocket.send_json({"type": "VERDICT", "payload": verdict})

    except WebSocketDisconnect:
        print(f"🔌 Client {client_id} disconnected")
    except Exception as e:
        print(f"❌ Error: {e}")