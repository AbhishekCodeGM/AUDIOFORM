// js/main.js
if (window.location.pathname.includes('welcome.html') || window.location.pathname.endsWith('/')) {
    let started = false;
    
    function startAssistant() {
        if (started) return;
        started = true;
        
        (async () => {
            try {
                // Step 1: Ask for language - English and Hindi
                await Voice.speak('Which language do you prefer? Say English or Hindi.');
                console.log('[Welcome] Speaking language question');
                
                // Wait for user to be ready to speak (increased to 1500ms for better recognition)
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Listen for language - with retry logic
                let langResponse = null;
                let languageAttempts = 0;
                while (languageAttempts < 3 && !langResponse) {
                    try {
                        console.log(`[Welcome] Listening for language choice (attempt ${languageAttempts + 1})...`);
                        langResponse = await Voice.listen();
                        console.log('[Welcome] Language response received:', langResponse);
                        
                        if (!langResponse || langResponse.trim() === '') {
                            throw new Error('Empty response received');
                        }
                    } catch (listenError) {
                        languageAttempts++;
                        console.warn(`[Welcome] Listen attempt ${languageAttempts} failed:`, listenError);
                        
                        if (languageAttempts < 3) {
                            // Ask user to try again
                            const retryText = 'I did not hear you clearly. Please say English or Hindi again.';
                            console.log('[Welcome] Speaking retry prompt');
                            await Voice.speak(retryText);
                            await new Promise(resolve => setTimeout(resolve, 1500));
                        }
                    }
                }
                
                if (!langResponse) {
                    console.error('[Welcome] Failed to get language after 3 attempts');
                    throw new Error('Language recognition failed after multiple attempts');
                }
                
                const langLower = langResponse.toLowerCase();
                const lang = (langLower.includes('hindi') || langResponse.includes('हिंदी')) ? 'Hindi' : 'English';
                console.log('[Welcome] Selected language:', lang);
                State.setLanguage(lang);
                Voice.setLanguage(lang);
                
                // Speak language confirmation
                const langConfirmText = lang === 'Hindi' 
                    ? 'आपने हिंदी चुना है। ठीक है।'
                    : 'You selected English. Alright.';
                console.log('[Welcome] Speaking language confirmation:', langConfirmText);
                await Voice.speak(langConfirmText);
                
                // Give a small delay for language to be set properly
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Step 2: Ask for mode (voice or text) - now in selected language
                let modePrompt = 'Do you want voice assistance or text based help? Say voice or text.';
                if (lang === 'Hindi') {
                    modePrompt = 'क्या आप आवाज़ सहायता चाहते हैं या पाठ आधारित मदद? आवाज़ या पाठ कहें।';
                }
                console.log('[Welcome] Speaking mode question:', modePrompt);
                await Voice.speak(modePrompt);
                
                // Wait for user to be ready to speak (increased to 1500ms)
                await new Promise(resolve => setTimeout(resolve, 1500));
                
                // Listen for mode - with retry logic
                let modeResponse = null;
                let modeAttempts = 0;
                while (modeAttempts < 3 && !modeResponse) {
                    try {
                        console.log(`[Welcome] Listening for mode choice (attempt ${modeAttempts + 1})...`);
                        modeResponse = await Voice.listen();
                        console.log('[Welcome] Mode response received:', modeResponse);
                        
                        if (!modeResponse || modeResponse.trim() === '') {
                            throw new Error('Empty response received');
                        }
                    } catch (listenError) {
                        modeAttempts++;
                        console.warn(`[Welcome] Mode listen attempt ${modeAttempts} failed:`, listenError);
                        
                        if (modeAttempts < 3) {
                            // Ask user to try again
                            let retryModeText = 'I did not hear you. Please say voice or text.';
                            if (lang === 'Hindi') {
                                retryModeText = 'मुझे नहीं सुना। कृपया आवाज़ या पाठ कहें।';
                            }
                            console.log('[Welcome] Speaking mode retry prompt');
                            await Voice.speak(retryModeText);
                            await new Promise(resolve => setTimeout(resolve, 1500));
                        }
                    }
                }
                
                if (!modeResponse) {
                    console.error('[Welcome] Failed to get mode after 3 attempts, defaulting to voice');
                    modeResponse = 'voice';
                }
                
                const modeLower = modeResponse.toLowerCase();
                const mode = (modeLower.includes('voice') || modeResponse.includes('आवाज़') || modeResponse.includes('आवाज')) ? 'voice' : 'text';
                console.log('[Welcome] Selected mode:', mode);
                State.setAccessibilityMode(mode);
                
                // Confirmation - in selected language
                let confirmText = '';
                if (lang === 'Hindi') {
                    confirmText = `शानदार! आपने ${lang} और ${mode} सहायता चुनी है। चलिए शुरू करते हैं।`;
                } else {
                    confirmText = `Great! You selected ${lang} with ${mode} assistance. Let's begin.`;
                }
                console.log('[Welcome] Speaking confirmation:', confirmText);
                await Voice.speak(confirmText);
                
                // Navigate to form selection after confirmation
                console.log('[Welcome] Navigating to form-selection.html');
                await new Promise(resolve => setTimeout(resolve, 1000));
                window.location.href = 'form-selection.html';
                
            } catch (error) {
                console.error('[Welcome] Critical voice error:', error);
                // Final fallback: Set defaults and navigate
                console.log('[Welcome] Using fallback defaults: English, voice mode');
                State.setLanguage('English');
                Voice.setLanguage('English');
                State.setAccessibilityMode('voice');
                
                // Speak error message before navigating
                try {
                    await Voice.speak('There was an issue. Proceeding with default settings.');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                } catch (e) {
                    console.error('[Welcome] Could not speak error message:', e);
                }
                
                window.location.href = 'form-selection.html';
            }
        })();
    }
    
    // Auto-start voice
    window.addEventListener('load', () => {
        console.log('[Welcome] Page loaded, starting assistant in 1 second');
        setTimeout(startAssistant, 1000);  // Increased delay to ensure Voice initialization
    });
    
    // Fallback: allow click/keypress
    document.addEventListener('click', startAssistant);
    document.addEventListener('keypress', startAssistant);
}