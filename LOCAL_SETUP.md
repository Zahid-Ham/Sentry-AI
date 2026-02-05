# 🚀 SentryAI - LOCAL SETUP GUIDE

## ✅ What You Need:

1. **Python 3.11+** installed
2. **ffmpeg.exe** in the backend folder (already there)
3. **.env file** with your GROQ_API_KEY
4. **Chrome extension** loaded locally

---

## 📝 Step 1: Create .env File

Create a file named `.env` in `backend/` folder:

```
GROQ_API_KEY=your_actual_groq_api_key_here
```

**Get your key from:** https://console.groq.com

---

## 🔧 Step 2: Install Dependencies

Open PowerShell in the backend folder:

```powershell
cd C:\Users\ZAHID\Desktop\SentryAI_Project\backend

# Create virtual environment
python -m venv env

# Activate it
.\env\Scripts\Activate.ps1

# Install packages
pip install -r requirements.txt
```

---

## 🎯 Step 3: Start Backend Server

```powershell
# Make sure you're in backend folder with env activated
python main.py
```

**You should see:**
```
🚀 Loading Vosk Model...
✅ Vosk Loaded! (Ready for Hindi/English)
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**KEEP THIS TERMINAL OPEN!**

---

## 🧩 Step 4: Load Extension in Chrome

```
1. Open Chrome
2. Go to: chrome://extensions/
3. Turn ON "Developer mode" (top right)
4. Click "Load unpacked"
5. Select: C:\Users\ZAHID\Desktop\SentryAI_Project\extension
6. Close the tab
```

---

## 🎬 Step 5: Test It

```
1. Open YouTube or any website with audio
2. Click SentryAI icon in Chrome
3. You should see a monitor window pop up
4. It should say "● PROTECTED CONNECTION"
5. Speak something → It should detect and analyze
```

---

## ❌ Troubleshooting

### Backend won't start
```
Error: ModuleNotFoundError: No module named 'vosk'
→ Did you activate the virtual environment?
→ Did you run: pip install -r requirements.txt ?
```

### "Connection refused"
```
Error: ConnectionRefusedError
→ Is backend.py still running? (See terminal with "Uvicorn running")
→ Is it on http://0.0.0.0:8000 ?
```

### GROQ_API_KEY missing
```
Error: ❌ ERROR: GROQ_API_KEY not found in .env file!
→ Create .env file in backend/ folder
→ Add your GROQ_API_KEY
→ Restart backend (python main.py)
```

### Extension shows "Connection Error"
```
→ Check that backend is running (see terminal)
→ Check .env file has valid GROQ_API_KEY
→ Reload extension (chrome://extensions → Reload button)
```

### No speech detected
```
→ Give microphone permission when browser asks
→ Try speaking louder/closer to mic
→ Check browser supports Web Speech API (Chrome/Edge)
→ Look at backend terminal for error messages
```

---

## 📊 How to Monitor

**Backend Terminal:**
- Shows incoming connections
- Shows detected speech
- Shows threat analysis results

**Browser Console (F12):**
- Shows any JavaScript errors
- Shows WebSocket connection status

**Monitor Window:**
- "● PROTECTED CONNECTION" = Connected
- "🗣️ Heard: [text]" = Speech detected
- "📊 [score]" = Analysis result
- "🚨 THREAT!" = Threat detected

---

## 🛑 To Stop

```
1. Close Chrome
2. In backend terminal: Press Ctrl+C
3. Deactivate Python: Type "deactivate"
```

---

## ✅ Everything Ready?

- [ ] .env file created with GROQ_API_KEY
- [ ] Virtual environment activated
- [ ] Dependencies installed
- [ ] Backend running on http://0.0.0.0:8000
- [ ] Extension loaded in Chrome
- [ ] Monitor window opens

If all checked → Try speaking now! 🎤
