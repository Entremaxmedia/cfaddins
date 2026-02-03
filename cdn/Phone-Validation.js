document.addEventListener('DOMContentLoaded', function() {
  const phoneInput = document.querySelector('.elS1Phone');
  const step1Button = document.querySelector('.elButtonStep1');
  
  if (!phoneInput || !step1Button) return;
  
  function showError(message) {
    phoneInput.style.border = '2px solid #cc0000';
    phoneInput.style.backgroundColor = '#fff0f0';
    alert(message);
    phoneInput.focus();
  }
  
  function clearError() {
    phoneInput.style.border = '';
    phoneInput.style.backgroundColor = '';
  }
  
  // Clear error styling and normalize on blur
  phoneInput.addEventListener('input', clearError);
  
  phoneInput.addEventListener('blur', function() {
    const digits = phoneInput.value.replace(/\D/g, '');
    if (digits.length === 10) {
      phoneInput.value = '+1' + digits;
    } else if (digits.length === 11 && digits.charAt(0) === '1') {
      phoneInput.value = '+1' + digits.substring(1);
    }
  });
  
  step1Button.addEventListener('click', function(e) {
    const rawPhone = phoneInput.value.trim();
    
    // Check for letters
    if (/[a-zA-Z]/.test(rawPhone)) {
      e.preventDefault();
      e.stopPropagation();
      showError('Please enter a valid phone number (no letters)');
      return false;
    }
    
    const digits = rawPhone.replace(/\D/g, '');
    
    // Handle if they already entered with country code
    const phone = digits.length === 11 && digits.charAt(0) === '1' 
      ? digits.substring(1) 
      : digits;
    
    // Check length
    if (phone.length !== 10) {
      e.preventDefault();
      e.stopPropagation();
      showError('Please enter a valid 10-digit phone number');
      return false;
    }
    
    // Block obvious fakes
    const fakePatterns = [
      /^(\d)\1{9}$/,
      /^1234567890$/,
      /^0123456789$/,
      /^9876543210$/,
      /^1234512345$/
    ];
    
    if (fakePatterns.some(pattern => pattern.test(phone))) {
      e.preventDefault();
      e.stopPropagation();
      showError('Please enter your real phone number');
      return false;
    }
    
    // Block invalid US area codes
    if (phone.charAt(0) === '0' || phone.charAt(0) === '1') {
      e.preventDefault();
      e.stopPropagation();
      showError('Please enter a valid phone number');
      return false;
    }
    
    // Normalize to E.164 format
    phoneInput.value = '+1' + phone;
    
    clearError();
  });
});
