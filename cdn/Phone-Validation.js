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
  
  // Clear error styling when user starts typing
  phoneInput.addEventListener('input', clearError);
  
  step1Button.addEventListener('click', function(e) {
    const phone = phoneInput.value.replace(/\D/g, '');
    
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
    
    clearError();
  });
});
