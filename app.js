// Firebase Configuration and Initialization
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyACCpl5f7g34Fs0eMxUguBuGE80SuKZCIA",
    authDomain: "hrms-326ad.firebaseapp.com",
    projectId: "hrms-326ad",
    storageBucket: "hrms-326ad.firebasestorage.app",
    messagingSenderId: "813107687048",
    appId: "1:813107687048:web:2d3c2fff54a65285ba793d",
    measurementId: "G-HXGFCBV64Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Form validation helper
function validateForm() {
    const requiredFields = ['name', 'phone', 'email', 'location', 'leadSource', 'whyWantToJoin'];
    const errors = [];

    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            errors.push(`${field.placeholder || field.name} is required`);
            field.focus();
        }
    });

    // Validate leadSourceOther if others is selected
    const leadSource = document.getElementById('leadSource').value;
    const leadSourceOther = document.getElementById('leadSourceOther');
    if (leadSource === 'others' && !leadSourceOther.value.trim()) {
        errors.push('Please specify where you heard about us');
        leadSourceOther.focus();
    }

    // Email validation
    const email = document.getElementById('email').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
        errors.push('Please enter a valid email address');
        document.getElementById('email').focus();
    }

    // Phone validation (basic)
    const phone = document.getElementById('phone').value;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (phone && !phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
        errors.push('Please enter a valid phone number');
        document.getElementById('phone').focus();
    }

    return errors;
}

// Form submission handler
window.submitJoinForm = async function(event) {
    event.preventDefault();
    
    // Show loading state
    showLoading(true);
    showMessage('', true); // Clear previous messages

    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
        showLoading(false);
        showMessage(validationErrors[0], false);
        return;
    }

    // Get form values
    const name = document.getElementById('name').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const instagramId = document.getElementById('instagramId').value.trim();
    const location = document.getElementById('location').value.trim();
    const leadSource = document.getElementById('leadSource').value;
    const leadSourceOther = document.getElementById('leadSourceOther').value.trim();
    const whatTheyDo = document.getElementById('whatTheyDo').value.trim();
    const whyWantToJoin = document.getElementById('whyWantToJoin').value.trim();

    // Handle lead source
    let finalLeadSource = leadSource;
    if (leadSource === 'others') {
        finalLeadSource = `Others: ${leadSourceOther}`;
    }

    try {
        // Submit to Firestore
        await addDoc(collection(db, 'joinRequests'), {
            name: name,
            phone: phone,
            email: email,
            instagramId: instagramId,
            location: location,
            leadSource: finalLeadSource,
            whatTheyDo: whatTheyDo,
            whyWantToJoin: whyWantToJoin,
            timestamp: serverTimestamp()
        });

        // Success handling
        showLoading(false);
        showMessage('🎉 Your request has been submitted successfully! We\'ll get back to you soon.', true);
        
        // Reset form after a short delay
        setTimeout(() => {
            document.getElementById('joinForm').reset();
            document.getElementById('otherFieldContainer').classList.add('hidden');
            document.getElementById('leadSourceOther').required = false;
            
            // Clear message after form reset
            setTimeout(() => {
                showMessage('', true);
            }, 3000);
        }, 2000);

    } catch (error) {
        console.error("Error writing document: ", error);
        showLoading(false);
        
        // More specific error messages
        let errorMessage = 'Error submitting your request. Please try again.';
        if (error.code === 'unavailable') {
            errorMessage = 'Service temporarily unavailable. Please check your internet connection and try again.';
        } else if (error.code === 'permission-denied') {
            errorMessage = 'Permission denied. Please contact support.';
        }
        
        showMessage(errorMessage, false);
    }
};

// Additional utility functions
function resetFormMessages() {
    showMessage('', true);
}

// Form interaction enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Add input event listeners for real-time validation feedback
    const inputs = document.querySelectorAll('.form-input');
    
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            // Clear error state when user starts typing
            if (this.classList.contains('border-red-400')) {
                this.classList.remove('border-red-400');
                this.classList.add('border-white/10');
            }
        });

        // Add focus/blur animations
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });

        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });

    // Form submission prevention for invalid states
    const form = document.getElementById('joinForm');
    form.addEventListener('submit', function(e) {
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn.disabled) {
            e.preventDefault();
            return false;
        }
    });

    // Keyboard navigation improvements
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            const form = document.getElementById('joinForm');
            const formData = new FormData(form);
            let allFilled = true;
            
            // Check if all required fields are filled
            const requiredFields = ['name', 'phone', 'email', 'location', 'leadSource', 'whyWantToJoin'];
            requiredFields.forEach(field => {
                if (!document.getElementById(field).value.trim()) {
                    allFilled = false;
                }
            });

            if (allFilled) {
                form.requestSubmit();
            }
        }
    });

    // Auto-resize textarea
    const textarea = document.getElementById('whyWantToJoin');
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 200) + 'px';
    });

    // Add subtle entrance animation
    const glassCard = document.querySelector('.glass-card');
    glassCard.style.opacity = '0';
    glassCard.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        glassCard.style.transition = 'all 0.6s ease-out';
        glassCard.style.opacity = '1';
        glassCard.style.transform = 'translateY(0)';
    }, 100);
});

// Error highlighting helper
function highlightError(fieldId) {
    const field = document.getElementById(fieldId);
    field.classList.remove('border-white/10');
    field.classList.add('border-red-400');
    field.focus();
}

// Success animation helper
function showSuccessAnimation() {
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.classList.add('animate-pulse');
    
    setTimeout(() => {
        submitBtn.classList.remove('animate-pulse');
    }, 1000);
}