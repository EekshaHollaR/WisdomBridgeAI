import os
import json
from openai import OpenAI

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

def generate_expert_interview_questions(expert_profile, existing_sessions):
    """
    Generates a list of interview questions based on the expert's profile and history.
    """
    prompt = f"""
    You are an expert interviewer extracting tacit knowledge from a senior expert.
    
    Expert Profile:
    Title: {expert_profile.title}
    Department: {expert_profile.department}
    Expertise: {expert_profile.domains_of_expertise}
    Years Experience: {expert_profile.years_experience}
    
    Generate 5 deep, situational interview questions that uncover decision-making models, 
    hidden heuristics, and lessons learned. Focus on 'why' and 'how'.
    
    Return ONLY a JSON array of strings.
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        data = json.loads(content)
        return data.get("questions", data if isinstance(data, list) else [])
    except Exception as e:
        print(f"Error generating questions: {e}")
        return ["Describe a challenging project you worked on.", "What is a key lesson you've learned?"]

def analyze_transcript_to_structured_notes(transcript):
    """
    Analyzes raw transcript to produce structured notes with sections, bullets, and concepts.
    """
    prompt = f"""
    Analyze the following interview transcript and structure the key insights.
    
    Transcript:
    {transcript[:15000]} # Limit context
    
    Output JSON with keys:
    - summary: string
    - key_takeaways: list of strings
    - core_concepts: list of strings
    - action_items: list of strings
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": "You are a knowledge analyst."}, {"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        return json.loads(content)
    except Exception as e:
        print(f"Error analyzing transcript: {e}")
        return {"summary": "Analysis failed", "error": str(e)}

def extract_knowledge_items_from_notes(notes):
    """
    Extracts atomic knowledge items from structured notes.
    """
    prompt = f"""
    Based on these notes, extract atomic Knowledge Items (principles, procedures, decision frameworks).
    
    Notes: {json.dumps(notes)}
    
    Return a JSON object with a key "items" containing a list of objects, each with:
    - title: string
    - description: string
    - type: "procedure" | "principle" | "framework" | "scenario"
    - tags: list of strings
    - importance: integer (1-5)
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "system", "content": "You are a knowledge engineer."}, {"role": "user", "content": prompt}],
            response_format={"type": "json_object"}
        )
        content = response.choices[0].message.content
        data = json.loads(content)
        return data.get("items", [])
    except Exception as e:
        print(f"Error extracting knowledge items: {e}")
        return []
