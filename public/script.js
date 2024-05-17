function showError(message) {
    var errorMessage = document.getElementById('error-message');
    errorMessage.style.display = 'block';
    errorMessage.textContent = message;
}

function validateForm() {
    var email = document.getElementById('email').value;
    var password = document.getElementById('password').value;

    if (!email || !password) {
        showError('Email and password are required.');
        return false;
    }


    return true;
}