import google.generativeai as genai

# PASTE YOUR KEY HERE
genai.configure(api_key="AIzaSyB6ZR9852wlUXMqpkBM49yglWdecZCntMc")

print("Checking available models...")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(f"- {m.name}")