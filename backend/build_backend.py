import PyInstaller.__main__
import os
import shutil

# Defne paths
backend_dir = os.path.dirname(os.path.abspath(__file__))
main_script = os.path.join(backend_dir, "main.py")
model_dir = os.path.join(backend_dir, "model")
ffmpeg_exe = os.path.join(backend_dir, "ffmpeg.exe")
ffprobe_exe = os.path.join(backend_dir, "ffprobe.exe")
icon_path = os.path.join(backend_dir, "icon.ico") # Optional, if you have one

# Ensure output directory exists
dist_path = os.path.join(backend_dir, "dist")
if os.path.exists(dist_path):
    shutil.rmtree(dist_path)

import vosk
vosk_dir = os.path.dirname(vosk.__file__)

# PyInstaller arguments
args = [
    main_script,
    '--name=SentryAI_Server',
    '--onedir',  # Create a directory (easier for debugging & antivirus)
    '--console', # Keep console open to see logs (change to --windowed to hide)
    '--clean',
    '--noconfirm',
    # Add Data: Source;Destination
    f'--add-data={model_dir};model',
    # FORCEFULLY ADD VOSK PACKAGE properly
    f'--add-data={vosk_dir};vosk',
    # Add Binaries: Source;Destination
    f'--add-binary={ffmpeg_exe};.',
    f'--add-binary={ffprobe_exe};.',
    # Hidden imports if needed (uvicorn usually needs these)
    '--hidden-import=uvicorn.logging',
    '--hidden-import=uvicorn.loops',
    '--hidden-import=uvicorn.loops.auto',
    '--hidden-import=uvicorn.protocols',
    '--hidden-import=uvicorn.protocols.http',
    '--hidden-import=uvicorn.protocols.http.auto',
    '--hidden-import=uvicorn.lifespan',
    '--hidden-import=uvicorn.lifespan.on',
    '--hidden-import=engineio.async_drivers.asgi', # Common for socketio/websockets
    
    # Exclude unnecessary heavy libraries that PyInstaller might accidentally pick up
    '--exclude-module=torch',
    '--exclude-module=tensorflow',
    '--exclude-module=torchvision',
    '--exclude-module=transformers',
    '--exclude-module=matplotlib',
    '--exclude-module=pandas',
    '--exclude-module=scipy',
    '--exclude-module=tkinter',
    '--exclude-module=sqlite3', # As requested, if not used
    '--exclude-module=IPython',
]

if os.path.exists(icon_path):
    args.append(f'--icon={icon_path}')

print("🚀 Starting Build Process...")
print(f"Build arguments: {args}")

PyInstaller.__main__.run(args)

print("\n✅ Build Complete!")
print(f"Your executable is located at: {os.path.join(dist_path, 'SentryAI_Server', 'SentryAI_Server.exe')}")
