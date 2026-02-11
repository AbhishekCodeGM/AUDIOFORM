# AudioForm

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](#)
[![Python](https://img.shields.io/badge/python-3.8%2B-blue)](#)

AudioForm is an accessibility-first web application that helps users fill forms using voice or text. The frontend uses the Web Speech API for speech recognition and speech synthesis, while the backend uses a Flask API and Google Generative AI (Gemini) to generate friendly, simplified field prompts in multiple languages (English/Hindi).

## Quick Links
- Live locally: `http://localhost:8000/HTML/welcome.html`
- Backend API: `http://localhost:5000/ask-question`

---

## Features
- Voice and text input modes
- English and Hindi language support
- AI-generated plain-language prompts for each form field (via Gemini)
- Listening indicator and summary/confirm flow
- Session-based state (sessionStorage)

## Repo Structure
```
AudioForm/
├── Backend/
│   ├── app.py
│   ├── gemini_client.py
│   ├── prompts.py
│   ├── requirements.txt
│   └── .env (DO NOT COMMIT - contains GEMINI_API_KEY)
└── Frontend/
    ├── HTML/
    ├── css/
    └── js/
```

## Quickstart (Development)

1. Clone the repository:
```bash
git clone https://github.com/AbhishekCodeGM/AUDIOFORM.git
cd AUDIOFORM
```

2. Backend: create a virtual environment and install dependencies
```bash
cd Backend
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1
# or cmd
.\.venv\Scripts\activate.bat

pip install -r requirements.txt
```

3. Create a `.env` file in `Backend/` with your Gemini API key:
```text
GEMINI_API_KEY=your_real_key_here
```

4. Start the backend (default port 5000):
```bash
python app.py
```

5. Serve the frontend (use HTTP to ensure CSS/TTS work):
```bash
cd ../Frontend
python -m http.server 8000
# Open: http://localhost:8000/HTML/welcome.html
```

## Browser Recommendations
- Use Chrome or Chromium-based browsers for best Web Speech API support.
- Allow microphone access when prompted.
- If speech synthesis (Hindi) is silent, check system/browser voice packs and console logs.

## Security Notice
I noticed `Backend/.env` was present earlier. If you have already pushed a real API key to a public repository, immediately rotate/revoke the key and remove it from the repo history.

To stop committing `.env` and remove it from the index (without rewriting history):
```bash
# Add to .gitignore then remove from index
echo 'Backend/.env' >> .gitignore
git rm --cached Backend/.env
git commit -m "Remove .env from repo and add to .gitignore"
git push
```

To fully remove from history, use `bfg` or `git filter-repo` (advanced; requires care and force-push).

## Contributing
- Fork the repository, create a branch, implement changes, and open a pull request.

## License
Choose a license (e.g., MIT) and add it here.

---

If you want, I can also add a short `CONTRIBUTING.md`, create a repo GitHub release, or help remove the `.env` from history. Let me know which action to take next.
