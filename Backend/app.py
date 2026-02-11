# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from gemini_client import generate_question
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/ask-question', methods=['POST'])
def ask_question():
    data = request.get_json()
    
    if not data or 'field_name' not in data or 'language' not in data:
        return jsonify({'error': 'Invalid input'}), 400
    
    field_name = data['field_name']
    language = data['language']
    
    if not isinstance(field_name, str) or not isinstance(language, str):
        return jsonify({'error': 'Invalid input'}), 400
    
    if not field_name.strip() or not language.strip():
        return jsonify({'error': 'Invalid input'}), 400
    
    try:
        print(f"Processing: field_name='{field_name}', language='{language}'")
        simplified_question = generate_question(field_name, language)
        print(f"Success: Got question")
        return jsonify({'simplified_question': simplified_question}), 200
    except Exception as e:
        error_msg = str(e)
        print(f"Error: {error_msg}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Internal server error', 'details': error_msg}), 500

if __name__ == '__main__':
    app.run(debug=True)