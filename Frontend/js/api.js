// js/api.js
const API = {
    baseUrl: 'http://localhost:5000',
    
    askQuestion: async function(fieldName, language) {
        try {
            console.log(`Asking API: field_name="${fieldName}", language="${language}"`);
            const response = await fetch(`${this.baseUrl}/ask-question`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    field_name: fieldName,
                    language: language
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error(`API Error ${response.status}:`, errorData);
                // Return simple fallback question on error
                if (language && language.toLowerCase() === 'hindi') {
                    return `कृपया ${fieldName} बताएं।`;
                } else {
                    return `Please provide your ${fieldName}.`;
                }
            }
            
            const data = await response.json();
            return data.simplified_question || fieldName;
        } catch (error) {
            console.error('API Error:', error);
            // Return simple fallback question on error
            if (language && language.toLowerCase() === 'hindi') {
                return `कृपया ${fieldName} बताएं।`;
            } else {
                return `Please provide your ${fieldName}.`;
            }
        }
    }
};