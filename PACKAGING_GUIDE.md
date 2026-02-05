# Packaging Guide for SentryAI

This guide explains how to convert your Python backend into a standalone `.exe` file that works on any Windows machine without installing Python.

## Prerequisites

1.  Open your terminal in `backend/` folder.
2.  Install PyInstaller:
    ```bash
    pip install pyinstaller
    ```

## How to Build

We have created a script to automate the build for you.

1.  Run the build script:
    ```bash
    python build_backend.py
    ```
2.  Wait for it to finish (approx 1 minute). It will copy the `model` folder and `ffmpeg` binaries.

## Where is my App?

Go to: `backend/dist/SentryAI_Server/`

You will see:
-   `SentryAI_Server.exe` (The main app application)
-   `_internal/` folder (Contains libraries, `model`, and `ffmpeg`)

## How to Distribute to Users

1.  **Zip the folder**: Right-click the `SentryAI_Server` folder inside `dist` -> Send to -> Compressed (zipped) folder.
2.  **Share the Zip**: Send this zip file to your users.

### User Instructions
1.  Unzip the file.
2.  (Optional) Create a `.env` file next to `.exe` with their `GROQ_API_KEY` if required, or ensure you build a way for them to input it.
3.  Double-click `SentryAI_Server.exe`.
4.  A black window will open saying "Uvicorn running...".
5.  Now the Chrome Extension can connect!

## Troubleshooting

-   **"Failed to execute script"**: Run the `.exe` from a terminal (PowerShell) to see the error message.
-   **Missing DLLs**: If it fails on other computers, they might need "Visual C++ Redistributable", but usually PyInstaller includes necessary files.
