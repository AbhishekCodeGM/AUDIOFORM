# gemini_client.py
import google.generativeai as genai
import os
from prompts import get_prompt_template

genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-pro')

def generate_question(field_name, language):
    try:
        prompt = get_prompt_template(field_name, language)
        print(f"Sending to Gemini: {prompt[:100]}...")
        response = model.generate_content(prompt)
        result = response.text
        print(f"Gemini response: {result[:100]}...")
        return result
    except Exception as e:
        print(f"Gemini API Error: {str(e)}")
        # Fallback: Return a simple question instead of failing
        if language.lower() == 'hindi':
            return f"कृपया {field_name} बताएं।"
        else:
            return f"Please provide your {field_name}."