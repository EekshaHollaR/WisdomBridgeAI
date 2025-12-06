from django.conf import settings
from openai import OpenAI

client = OpenAI(api_key=settings.OPENAI_API_KEY)

def generate_learning_path(goal, experience_level):
    prompt = f"""
    Create a detailed learning path for a learner with {experience_level} experience who wants to: {goal}.
    Return a JSON structure with list of modules, each having title, description, easy/medium/hard difficulty, and estimated hours.
    MAX 5 modules.
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error generating learning path: {e}")
        return "[]"

def generate_mentor_response(history, context):
    context_str = f"""
    Context:
    Scenario: {context.get('scenario_title')}
    Situation: {context.get('situation')}
    Expert Approach: {context.get('expert_approach')}
    Risks: {context.get('risks')}
    
    Learner Profile:
    - Style: {context.get('learning_style', 'General')}
    - Level: {context.get('clarity_level', 'Intermediate')}
    """

    system_prompt = f"""
    You are an expert mentor guiding a learner.
    {context_str}
    
    Your Goal:
    Guide them using Socratic questioning. Adapt your explanation to their level and style.
    - If Visual: Use metaphors and painting-pictures language.
    - If Hands-on: Suggest practical steps.
    - If Beginner: Use simple analogies.
    - If Advanced: Be concise and technical.
    
    Maintain the persona of a senior professional.
    """
    
    messages = [{"role": "system", "content": system_prompt}]
    
    # Append history
    for msg in history:
        # map sender_type to role
        role = "assistant" if msg['sender_type'] == 'ai' else "user"
        if msg['sender_type'] == 'expert': role = "assistant" 
        
        messages.append({"role": role, "content": msg['content']})
        
    try:
        response = client.chat.completions.create(
            model="gpt-4", 
            messages=messages,
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"Error generating mentor response: {e}")
        return "I'm having trouble connecting to my knowledge base right now. What do you think is the next best step?"

def generate_assessment_questions(module_title, content, num_questions=5):
    system_prompt = f"""
    You are an expert examiner. Create {num_questions} assessment questions based on the content below.
    Return ONLY valid JSON in this format:
    [
        {{
            "question_type": "MCQ", 
            "prompt": "Question text", 
            "options": ["A", "B", "C", "D"], 
            "correct_answer": "A",
            "weight": 1.0
        }},
        {{
            "question_type": "OPEN_ENDED", 
            "prompt": "Question text", 
            "options": null,
            "correct_answer": "Key points related to...",
            "weight": 2.0
        }}
    ]
    """
    
    user_prompt = f"Module: {module_title}\n\nContent Summary: {content[:2000]}"
    
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7
        )
        import json
        content = response.choices[0].message.content
        # Basic cleanup if GPT adds markdown code blocks
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        return json.loads(content)
    except Exception as e:
        print(f"Error generating assessment: {e}")
        return []

def ask_virtual_expert(query, context):
    system_prompt = f"""
    You are an expert consultant with deep domain knowledge.
    
    Context:
    {context}
    
    Your Decision Style:
    - Analytical and risk-aware.
    - Draws from past experiences (simulated).
    - Direct and actionable advice.
    
    Answer the user's query as this expert.
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": query}
            ],
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        return "I cannot provide an expert opinion right now."

def generate_expert_interview_questions(expert_profile, existing_questions=None):
    if existing_questions is None:
        existing_questions = []

    prompt = f"""
    You are an expert interviewer. 
    Expert Profile: {expert_profile.title} - {expert_profile.bio}
    Expertise: {expert_profile.expertise_tags}
    
    Previous Questions asked: {existing_questions}
    
    Generate 3 deep, insightful interview questions to extract their tacit knowledge on a specific topic within their expertise.
    Return ONLY a JSON list of strings.
    Example: ["Question 1?", "Question 2?", "Question 3?"]
    """
    
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        import json
        content = response.choices[0].message.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        return json.loads(content)
    except Exception as e:
        print(f"Error generating interview questions: {e}")
        return [
            "Can you tell me about a complex problem you solved recently?",
            "What are the most common mistakes beginners make in your field?",
            "How do you approach high-stakes decision making?"
        ]

def analyze_transcript_to_structured_notes(transcript):
    prompt = f"""
    Analyze this interview transcript and extract structured notes.
    Transcript: {transcript[:4000]}... (truncated)
    
    Return JSON: {{ "summary": "...", "key_concepts": [], "actionable_steps": [] }}
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        import json
        content = response.choices[0].message.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        return json.loads(content)
    except Exception as e:
        print(f"Error analyzing transcript: {e}")
        return {"summary": "Analysis failed.", "key_concepts": [], "actionable_steps": []}

def extract_knowledge_items_from_notes(notes):
    prompt = f"""
    From these notes, extract atomic 'Knowledge Items'.
    Notes: {notes}
    
    Return JSON List of items: [ {{ "title": "...", "description": "...", "type": "PRINCIPLE|PROCEDURE", "tags": [], "importance": 1-10 }} ]
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        import json
        content = response.choices[0].message.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        return json.loads(content)
    except Exception as e:
        print(f"Error extracting items: {e}")
        return []

def structure_session_into_modules(notes, items):
    prompt = f"""
    Structure this content into a Learning Module.
    Notes: {notes}
    Items: {items}
    
    Return JSON List of Modules: 
    [ 
      {{ 
        "title": "...", 
        "description": "...", 
        "objectives": [], 
        "difficulty": "BEGINNER",
        "scenarios": [ {{"title": "...", "situation": "...", "approach": "...", "risks": "..."}} ],
        "decision_tree": [ {{"id": "1", "prompt": "...", "yes_id": "2", "no_id": "3"}} ]
      }} 
    ]
    """
    try:
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": prompt}]
        )
        import json
        content = response.choices[0].message.content
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        return json.loads(content)
    except Exception as e:
        print(f"Error structuring modules: {e}")
        return []
