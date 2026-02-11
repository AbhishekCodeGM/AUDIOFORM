# prompts.py
def get_prompt_template(field_name, language):
    return f"You are an accessibility assistant.\nExplain the form field '{field_name}' in very simple {language}.\nAsk the user what information they should provide.\nUse short sentences.\nNo formatting. No extra text."
