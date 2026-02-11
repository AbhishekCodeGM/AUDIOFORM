// js/forms.js
const Forms = {
    'basic-registration': {
        titleEN: 'Basic Registration Form',
        titleHI: 'बेसिक पंजीकरण फॉर्म',
        fieldsEN: ['Name', 'Email', 'Phone', 'Address'],
        fieldsHI: ['नाम', 'ईमेल', 'फोन', 'पता']
    },
    'college-admission': {
        titleEN: 'College Admission Form',
        titleHI: 'कॉलेज प्रवेश फॉर्म',
        fieldsEN: ['Full Name', 'Date of Birth', 'Previous School', 'Course Preference', 'Guardian Name', 'Guardian Contact'],
        fieldsHI: ['पूरा नाम', 'जन्म की तारीख', 'पिछली स्कूल', 'पाठ्यक्रम प्राथमिकता', 'अभिभावक का नाम', 'अभिभावक संपर्क']
    },
    'job-application': {
        titleEN: 'Job Application Form',
        titleHI: 'नौकरी के आवेदन फॉर्म',
        fieldsEN: ['Full Name', 'Email', 'Phone Number', 'Position Applied', 'Years of Experience', 'Previous Company', 'Expected Salary'],
        fieldsHI: ['पूरा नाम', 'ईमेल', 'फोन नंबर', 'आवेदन की गई स्थिति', 'अनुभव के वर्ष', 'पिछली कंपनी', 'अपेक्षित वेतन']
    }
};

Forms.getTitle = function(formKey) {
    const language = State.getLanguage() || 'English';
    const form = this[formKey];
    return language === 'Hindi' ? form.titleHI : form.titleEN;
};

Forms.getFields = function(formKey) {
    const language = State.getLanguage() || 'English';
    const form = this[formKey];
    return language === 'Hindi' ? form.fieldsHI : form.fieldsEN;
};