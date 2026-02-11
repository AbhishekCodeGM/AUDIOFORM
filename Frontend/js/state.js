// js/state.js
const State = {
    setAccessibilityMode: function(mode) {
        sessionStorage.setItem('accessibilityMode', mode);
    },
    
    getAccessibilityMode: function() {
        return sessionStorage.getItem('accessibilityMode');
    },
    
    setLanguage: function(lang) {
        sessionStorage.setItem('language', lang);
    },
    
    getLanguage: function() {
        return sessionStorage.getItem('language');
    },
    
    setSelectedForm: function(form) {
        sessionStorage.setItem('selectedForm', form);
    },
    
    getSelectedForm: function() {
        return sessionStorage.getItem('selectedForm');
    },
    
    setFormAnswers: function(answers) {
        sessionStorage.setItem('formAnswers', JSON.stringify(answers));
    },
    
    getFormAnswers: function() {
        const answers = sessionStorage.getItem('formAnswers');
        return answers ? JSON.parse(answers) : {};
    }
};