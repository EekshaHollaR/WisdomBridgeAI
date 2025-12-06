import os
from openai import OpenAI

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def transcribe_audio(file_path):
    """
    Transcribes audio file using OpenAI Whisper.
    """
    if not os.path.exists(file_path):
        return "Error: File not found."
        
    try:
        with open(file_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1", 
                file=audio_file,
                response_format="text"
            )
        return transcript
    except Exception as e:
        print(f"Transcription error: {e}")
        return f"[Transcription Failed: {str(e)}]"
