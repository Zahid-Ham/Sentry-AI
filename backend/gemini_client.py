import google.generativeai as genai
from google.api_core import exceptions
import time

class GeminiClient:
    def __init__(self, api_keys):
        self.api_keys = api_keys
        self.current_key_index = 0
        self.model = None
        self.configure_client()

    def configure_client(self):
        # 1. Select Key
        key = self.api_keys[self.current_key_index]
        print(f"🔄 Switching to Gemini API Key #{self.current_key_index + 1}")
        
        # 2. Configure GenAI
        genai.configure(api_key=key)
        
        # 3. Setup Model (Gemini 2.0 Flash is best for speed)
        self.model = genai.GenerativeModel('gemini-2.0-flash')

    def rotate_key(self):
        print("⚠️ Quota Exceeded. Rotating API Key...")
        self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
        self.configure_client()
        # Wait a moment for the switch to register
        time.sleep(1)

    async def transcribe_audio(self, audio_path):
        """
        Transcribes audio. If Key #1 fails (429), it switches to Key #2 and RETRIES immediately.
        """
        try:
            # Upload file
            myfile = genai.upload_file(audio_path)
            
            # Generate Transcript
            result = self.model.generate_content([
                myfile, 
                "Listen to this audio. Transcribe it exactly in English (translating Hindi if needed). If it is silent or just noise, return 'SILENCE'."
            ])
            return result.text

        except Exception as e:
            # CHECK FOR QUOTA ERROR (429)
            if "429" in str(e) or "quota" in str(e).lower():
                self.rotate_key()
                # RETRY RECURSIVELY WITH NEW KEY
                return await self.transcribe_audio(audio_path)
            
            print(f"❌ Transcription Error: {e}")
            return None

    async def analyze_text(self, text_chunk, context_history=None):
        """
        Analyzes text for fraud. Also has auto-rotation.
        """
        prompt = f"""
        You are SentryAI. Analyze this call transcript for "Digital Arrest" fraud (Police/CBI threats, Money demands).
        Return ONLY a JSON object: {{'threat_score': 0-100, 'is_threat': boolean, 'reason': 'summary', 'entity': 'name'}}.
        TRANSCRIPT: {text_chunk}
        """

        try:
            response = self.model.generate_content(prompt)
            clean_json = response.text.replace("```json", "").replace("```", "").strip()
            return clean_json
            
        except Exception as e:
            if "429" in str(e) or "quota" in str(e).lower():
                self.rotate_key()
                # RETRY
                return await self.analyze_text(text_chunk, context_history)
            
            print(f"⚠️ Analysis Error: {e}")
            return None