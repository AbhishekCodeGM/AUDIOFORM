// js/voice.js
const Voice = {
    recognition: null,
    synthesis: window.speechSynthesis,
    availableVoices: [],
    voicesLoaded: false,
    isListening: false,
    timerInterval: null,
    currentLanguage: 'en-US',
    initialized: false,
    
    init: function() {
        // Restore language from State if available
        const storedLanguage = State && State.getLanguage ? State.getLanguage() : null;
        if (storedLanguage === 'Hindi') {
            this.currentLanguage = 'hi-IN';
            console.log('[Voice.init] Restored language from State: Hindi (hi-IN)');
        } else if (storedLanguage === 'English') {
            this.currentLanguage = 'en-US';
            console.log('[Voice.init] Restored language from State: English (en-US)');
        } else {
            console.log('[Voice.init] No language in State, using default: English (en-US)');
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.lang = this.currentLanguage;
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            
            // Expose recognition globally for direct handler attachment
            window.recognition = this.recognition;
            
            console.log('[Voice.init] Speech Recognition initialized with language:', this.currentLanguage);
            this.initialized = true;
        } else {
            console.error('[Voice.init] Speech Recognition not supported');
        }
        // Load available speech synthesis voices and listen for updates
        this.loadVoices();
    },

    loadVoices: function() {
        // Populate voices list; browsers may populate asynchronously
        const updateVoices = () => {
            try {
                this.availableVoices = this.synthesis.getVoices();
                this.voicesLoaded = this.availableVoices && this.availableVoices.length > 0;
                console.log('[Voice] Available voices count:', this.availableVoices.length);
                // Log a short list of voice names and langs for diagnostics
                this.availableVoices.slice(0, 20).forEach(v => console.log('[Voice] voice:', v.name, v.lang));
            } catch (e) {
                console.warn('[Voice] Error fetching voices:', e);
                this.availableVoices = [];
                this.voicesLoaded = false;
            }
        };

        updateVoices();
        // Some browsers (Chrome) fire 'voiceschanged' when voices become available
        window.speechSynthesis.onvoiceschanged = () => {
            updateVoices();
        };
    },

    ensureVoicesLoaded: function(timeoutMs = 2000) {
        return new Promise((resolve) => {
            if (this.voicesLoaded) return resolve(true);
            const start = Date.now();
            const check = () => {
                if (this.voicesLoaded || (Date.now() - start) > timeoutMs) return resolve(this.voicesLoaded);
                setTimeout(check, 100);
            };
            check();
        });
    },
    
    setLanguage: function(language) {
        // language: 'English' or 'Hindi'
        console.log('[Voice] setLanguage called with:', language);
        const langLower = language.toLowerCase();
        if (langLower === 'hindi') {
            this.currentLanguage = 'hi-IN';
            console.log('[Voice] Language set to Hindi (hi-IN)');
        } else {
            this.currentLanguage = 'en-US';
            console.log('[Voice] Language set to English (en-US)');
        }
        
        // Stop any ongoing recognition before changing language
        if (this.recognition) {
            try {
                this.recognition.stop();
                console.log('[Voice] Recognition stopped before language change');
            } catch (e) {
                // Ignore if not running
                console.log('[Voice] Recognition was not running');
            }
            // Update recognition language after stopping
            this.recognition.lang = this.currentLanguage;
            console.log('[Voice] Recognition language updated to:', this.currentLanguage);
        } else {
            // If recognition doesn't exist, reinitialize it
            console.log('[Voice] Recognition not initialized, reinitializing...');
            this.init();
        }
    },
    
    speak: function(text) {
        return new Promise(async (resolve) => {
            if (this.synthesis) {
                // Cancel any pending speech to avoid crackling
                try {
                    this.synthesis.cancel();
                } catch (e) {
                    // Ignore cancel errors
                }
                
                // Small delay to ensure cancel completes before starting new speech
                setTimeout(async () => {
                    const utterance = new SpeechSynthesisUtterance(text);

                    // Wait briefly for voices to be available and pick a matching voice
                    await this.ensureVoicesLoaded(3000);
                    try {
                        let selectedVoice = null;
                        if (this.currentLanguage === 'hi-IN') {
                            selectedVoice = this.availableVoices.find(v => v.lang && v.lang.toLowerCase().startsWith('hi'))
                                || this.availableVoices.find(v => /hindi/i.test(v.name));
                        } else {
                            selectedVoice = this.availableVoices.find(v => v.lang && v.lang.toLowerCase().startsWith('en'))
                                || this.availableVoices.find(v => /english/i.test(v.name));
                        }

                        if (selectedVoice) {
                            utterance.voice = selectedVoice;
                            console.log('[Voice.speak] Using voice:', selectedVoice.name, selectedVoice.lang);
                        } else {
                            console.log('[Voice.speak] No matching voice found for', this.currentLanguage, '- using default');
                        }
                        // Ensure audible volume
                        utterance.volume = 1.0;
                        utterance.rate = 1.0;
                        utterance.pitch = 1.0;
                    } catch (e) {
                        console.warn('[Voice.speak] Error selecting voice:', e);
                    }

                    // Set language for speech synthesis as a fallback
                    if (this.currentLanguage === 'hi-IN') {
                        utterance.lang = 'hi-IN';
                        console.log('[Voice.speak] Speaking in Hindi');
                    } else {
                        utterance.lang = 'en-US';
                        console.log('[Voice.speak] Speaking in English');
                    }

                    const textLength = text.length;
                    console.log('[Voice.speak] Text to speak (length:', textLength, '):', text.substring(0, 50) + '...');

                    let speechEnded = false;

                    // When speech ends, resolve the promise
                    utterance.onend = () => {
                        console.log('[Voice.speak] Speech ended (via onend event)');
                        speechEnded = true;
                        resolve();
                    };

                    utterance.onerror = (event) => {
                        console.warn('[Voice.speak] Speech error:', event.error);
                        speechEnded = true;
                        resolve(); // Resolve anyway so flow continues
                    };

                    // Fallback: if onend doesn't fire, resolve after estimated time
                    // Increased to ~60ms per character for longer texts
                    const estimatedTime = Math.max(textLength * 60, 2000);
                    console.log('[Voice.speak] Fallback timeout set to:', estimatedTime, 'ms');

                    const timeoutId = setTimeout(() => {
                        if (!speechEnded) {
                            console.log('[Voice.speak] Speech timeout reached - resolving');
                            speechEnded = true;
                            resolve();
                        }
                    }, estimatedTime);

                    console.log('[Voice.speak] Starting speech synthesis');
                    try {
                        this.synthesis.speak(utterance);
                    } catch (e) {
                        console.error('[Voice.speak] speak() threw an error:', e);
                        resolve();
                    }
                }, 50);
            } else {
                console.warn('[Voice.speak] Speech synthesis not available');
                resolve();
            }
        });
    },
    
    startTimer: function() {
        let timeRemaining = 10;
        const timerDisplay = document.getElementById('timer-display');
        
        if (timerDisplay) {
            timerDisplay.textContent = timeRemaining;
        }
        
        // Clear any existing timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            timeRemaining--;
            if (timerDisplay) {
                timerDisplay.textContent = timeRemaining;
            }
            
            if (timeRemaining <= 0) {
                clearInterval(this.timerInterval);
            }
        }, 1000);
    },
    
    stopTimer: function() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    },
    
    listen: function() {
        return new Promise((resolve, reject) => {
            if (!this.recognition) {
                reject('Speech recognition not supported');
                return;
            }
            
            // Prevent multiple start() calls
            if (this.isListening) {
                reject('Already listening');
                return;
            }
            
            this.isListening = true;
            let resultReceived = false;
            let timeout = null;
            
            this.recognition.onstart = () => {
                console.log('[Voice.listen] Recognition started');
                // Dispatch voice-start event
                document.dispatchEvent(new CustomEvent('voice-start'));
                // Show listening indicator
                const listeningIndicator = document.getElementById('listening-indicator');
                if (listeningIndicator) {
                    listeningIndicator.classList.add('active');
                }
                // Start the countdown timer
                this.startTimer();
                
                // Set timeout for no speech detection (12 seconds max)
                timeout = setTimeout(() => {
                    if (!resultReceived) {
                        console.warn('[Voice.listen] No speech detected within timeout period');
                        this.recognition.stop();
                        this.isListening = false;
                        reject('No speech detected - Please speak clearly');
                    }
                }, 12000);
            };
            
            this.recognition.onend = () => {
                console.log('[Voice.listen] Recognition ended');
                // Clear timeout
                if (timeout) clearTimeout(timeout);
                
                // Dispatch voice-end event
                document.dispatchEvent(new CustomEvent('voice-end'));
                // Hide listening indicator
                const listeningIndicator = document.getElementById('listening-indicator');
                if (listeningIndicator) {
                    listeningIndicator.classList.remove('active');
                }
                this.stopTimer();
                this.isListening = false;
                
                // If no result was received, reject
                if (!resultReceived) {
                    console.warn('[Voice.listen] Recognition ended without capturing speech');
                    reject('No speech captured');
                }
            };
            
            this.recognition.onresult = (event) => {
                console.log('[Voice.listen] Result received:', event.results[0][0].transcript);
                resultReceived = true;
                // Clear timeout
                if (timeout) clearTimeout(timeout);
                
                const transcript = event.results[0][0].transcript;
                this.recognition.stop();
                resolve(transcript);
            };
            
            this.recognition.onerror = (event) => {
                console.error('[Voice.listen] Recognition error:', event.error);
                resultReceived = true;
                // Clear timeout
                if (timeout) clearTimeout(timeout);
                
                this.isListening = false;
                this.recognition.stop();
                this.stopTimer();
                reject(`Speech recognition error: ${event.error}`);
            };
            
            console.log('[Voice.listen] Starting recognition with language:', this.currentLanguage);
            this.recognition.start();
        });
    }
};

// Initialize Voice, restoring language from State if available
if (!Voice.initialized) {
    Voice.init();
    console.log('[Voice] Voice system initialized');
} else {
    console.log('[Voice] Voice already initialized, skipping re-initialization');
}