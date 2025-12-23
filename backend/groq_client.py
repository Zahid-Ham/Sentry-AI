import os
from groq import AsyncGroq

class GroqClient:
    def __init__(self, api_key):
        self.client = AsyncGroq(api_key=api_key)
        # --- FIX 1: USE THE SMARTEST FREE MODEL ---
        # 70B is much better at Hindi + JSON than 8B
        self.model = "llama-3.3-70b-versatile" 

    async def analyze_text(self, text_chunk):
        # DEBUG: Tell us what we are receiving
        # print(f"   [DEBUG] Groq received {len(text_chunk)} chars")

        if not text_chunk or len(text_chunk) < 5:
            print("   [DEBUG] Text too short, skipping.")
            return None

        system_prompt = """
        You are SentryAI. Analyze this transcript for "Digital Arrest" fraud.
        
        SCORING RULES:
        - If you detect a scam (Police, CBI, Arrest threats, Money demands), the "threat_score" MUST be between 85 and 100.
        - If it is safe/casual conversation, the "threat_score" MUST be between 0 and 10.
        
        Return ONLY a JSON object: {"threat_score": int, "is_threat": bool, "reason": "string", "entity": "string"}.
        """

        try:
            # print("   [DEBUG] Sending request to Groq Cloud...")
            chat_completion = await self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"TRANSCRIPT: {text_chunk}"}
                ],
                model=self.model,
                temperature=0,
                # --- FIX 2: REMOVE STRICT JSON MODE TEMPORARILY ---
                # Sometimes this blocks Hindi responses. We will parse it manually.
                # response_format={"type": "json_object"} 
            )
            
            result = chat_completion.choices[0].message.content
            
            # DEBUG: Print the raw answer from AI
            # print(f"   [DEBUG] Groq Raw Answer: {result[:50]}...") 
            
            return result

        except Exception as e:
            print(f"   [ERROR] GROQ FAILED: {e}")
            return None