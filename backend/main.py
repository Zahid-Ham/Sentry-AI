from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from groq_client import GroqClient
from session_manager import SessionManager
from pydub import AudioSegment
import io
import os
import json
from vosk import Model, KaldiRecognizer, SetLogLevel
from dotenv import load_dotenv # Import this

# 1. Load Environment Variables
load_dotenv() 

# 2. Get the Key safely
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# Safety Check: Stop server if key is missing
if not GROQ_API_KEY:
    print("❌ ERROR: GROQ_API_KEY not found in .env file!")
    exit(1)
# --- 1. SETUP VOSK ---
SetLogLevel(-1) 

if not os.path.exists("model"):
    print("❌ ERROR: 'model' folder missing!")
    exit(1)

print("🚀 Loading Vosk Model...")
vosk_model = Model("model")
print("✅ Vosk Loaded! (Ready for Hindi/English)")

# --- 2. FFMPEG SETUP ---
current_dir = os.path.dirname(os.path.abspath(__file__))
ffmpeg_path = os.path.join(current_dir, "ffmpeg.exe")
ffprobe_path = os.path.join(current_dir, "ffprobe.exe")
AudioSegment.converter = ffmpeg_path
AudioSegment.ffmpeg = ffmpeg_path
AudioSegment.ffprobe = ffprobe_path
os.environ["PATH"] += os.pathsep + current_dir

app = FastAPI()

# --- 3. CONFIGURATION ---
# PASTE YOUR GROQ KEY HERE

groq_client = GroqClient(GROQ_API_KEY)
sessions = SessionManager()

@app.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    print(f"✅ Client {client_id} Connected")

    rec = KaldiRecognizer(vosk_model, 16000)

    try:
        while True:
            # --- CRITICAL FIX: Handle Disconnects Gracefully ---
            try:
                message = await websocket.receive()
            except RuntimeError:
                # This catches the specific "Cannot call receive" error
                print(f"🔌 Client {client_id} disconnected safely.")
                break

            if "bytes" in message:
                try:
                    # 1. Process Audio
                    audio_bytes = message["bytes"]
                    audio_segment = AudioSegment.from_file(io.BytesIO(audio_bytes), format="webm")
                    audio_segment = audio_segment.set_frame_rate(16000).set_channels(1).set_sample_width(2)
                    
                    # 2. Feed to Vosk
                    raw_data = audio_segment.raw_data
                    chunk_size = 4000
                    
                    for i in range(0, len(raw_data), chunk_size):
                        chunk = raw_data[i:i+chunk_size]
                        
                        if rec.AcceptWaveform(chunk):
                            result = json.loads(rec.Result())
                            text = result.get("text", "")
                            
                            if text:
                                print(f"🟢 Vosk Heard: {text}")
                                await websocket.send_json({"type": "TRANSCRIPT_SHOW", "text": text})
                                
                                # 3. SEND TO GROQ
                                print(f"🧠 Asking Groq (70B Model)...")
                                analysis_json = await groq_client.analyze_text(text)
                                
                                if analysis_json:
                                    # PARSE JSON TO CHECK SCORE BEFORE SENDING
                                    try:
                                        verdict_data = json.loads(analysis_json)
                                        print(f"⚡ VERDICT: {verdict_data}")
                                        
                                        await websocket.send_json({
                                            "type": "VERDICT", 
                                            "payload": verdict_data
                                        })
                                    except:
                                        pass

                except Exception as e:
                    print(f"⚠️ Process Error: {e}")
                    continue
            
            # Handle STOP command text if sent
            elif "text" in message:
                if message["text"] == "STOP":
                    print(f"🛑 Stop command received from {client_id}")
                    break

    except WebSocketDisconnect:
        print(f"Client {client_id} disconnected")
    except Exception as e:
        print(f"⚠️ Critical Error: {e}")