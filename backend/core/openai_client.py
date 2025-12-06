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
