import asyncio
import os
from groq import AsyncGroq

# PASTE YOUR KEY DIRECTLY HERE FOR TESTING
API_KEY = "gsk_" 

async def test_connection():
    print(f"🔑 Testing API Key: {API_KEY[:10]}...")
    
    client = AsyncGroq(api_key=API_KEY)
    
    try:
        print("⏳ Sending request to Groq...")
        chat_completion = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Say 'Hello SentryAI' if you can hear me."}
            ],
            model="llama-3.1-8b-instant",
        )
        print("\n✅ SUCCESS! Groq Responded:")
        print(chat_completion.choices[0].message.content)
        
    except Exception as e:
        print("\n❌ FAILED. Here is the error:")
        print(e)

if __name__ == "__main__":
    asyncio.run(test_connection())
