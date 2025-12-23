import time

class SessionManager:
    def __init__(self):
        self.sessions = {}

    def create_session(self, session_id):
        self.sessions[session_id] = {
            "start_time": time.time(),
            "transcript": [],
            "threat_log": [],
            "max_threat_score": 0
        }
        print(f"✅ New Session Started: {session_id}")

    def add_transcript(self, session_id, text):
        if session_id in self.sessions:
            timestamp = time.strftime("%H:%M:%S")
            entry = f"[{timestamp}] {text}"
            self.sessions[session_id]["transcript"].append(entry)
            # Keep only last 20 lines for context to save tokens
            return "\n".join(self.sessions[session_id]["transcript"][-20:])
        return ""

    def log_threat(self, session_id, analysis_result):
        if session_id in self.sessions:
            self.sessions[session_id]["threat_log"].append(analysis_result)
            # Update max threat score
            # (Assuming analysis_result is a dict parsed from JSON)
            pass