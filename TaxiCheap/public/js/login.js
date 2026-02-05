// Elementos del DOM
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePassword');
const rememberMeCheckbox = document.getElementById('rememberMe');
const forgotPasswordLink = document.querySelector('.forgot-password');
const createAccountLink = document.querySelector('.create-account');

// Toggle mostrar/ocultar contraseña
togglePasswordBtn.addEventListener('click', function(e) {
    e.preventDefault();
    
    const isPasswordVisible = passwordInput.type === 'text';
    
    if (isPasswordVisible) {
        passwordInput.type = 'password';
    } else {
        passwordInput.type = 'text';
    }
});

// Validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Mostrar/ocultar error
function showError(input, message) {
    input.classList.add('error');
    let errorMessage = input.parentElement.querySelector('.error-message');
    
    if (!errorMessage) {
        errorMessage = document.createElement('p');
        errorMessage.className = 'error-message';
        input.parentElement.appendChild(errorMessage);
    }
    
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
}

// Limpiar error
function clearError(input) {
    input.classList.remove('error');
    const errorMessage = input.parentElement.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.classList.remove('show');
    }
}

// Manejar envío del formulario
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Limpiar errores previos
    clearError(emailInput);
    clearError(passwordInput);
    
    // Validar campos
    let isValid = true;
    
    if (!emailInput.value.trim()) {
        showError(emailInput, 'Email is required');
        isValid = false;
    } else if (!isValidEmail(emailInput.value)) {
        showError(emailInput, 'Please enter a valid email');
        isValid = false;
    }
    
    if (!passwordInput.value.trim()) {
        showError(passwordInput, 'Password is required');
        isValid = false;
    } else if (passwordInput.value.length < 6) {
        showError(passwordInput, 'Password must be at least 6 characters');
        isValid = false;
    }
    
    if (isValid) {
        // Simular envío del formulario
        const signInButton = loginForm.querySelector('.sign-in-button');
        signInButton.disabled = true;
        signInButton.textContent = 'Signing in...';
        
        // Simular petición al servidor (2 segundos)
        setTimeout(() => {
            // Guardar estado si "Remember me" está activado
            if (rememberMeCheckbox.checked) {
                localStorage.setItem('rememberedEmail', emailInput.value);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
            
            // Simular éxito
            alert('Login exitoso!\n\nEmail: ' + emailInput.value + '\nRecordado: ' + (rememberMeCheckbox.checked ? 'Sí' : 'No'));
            
            signInButton.disabled = false;
            signInButton.textContent = 'Sign In';
            
            // Limpiar formulario
            loginForm.reset();
            passwordInput.type = 'password';
        }, 2000);
    }
});

// Cargar email recordado al cargar la página
window.addEventListener('load', function() {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        rememberMeCheckbox.checked = true;
    }
});

// Limpiar error al escribir
emailInput.addEventListener('input', function() {
    if (emailInput.classList.contains('error')) {
        clearError(emailInput);
    }
});

passwordInput.addEventListener('input', function() {
    if (passwordInput.classList.contains('error')) {
        clearError(passwordInput);
    }
});

// Manejar enlaces
forgotPasswordLink.addEventListener('click', function(e) {
    e.preventDefault();
    alert('Redirigiendo a página de recuperación de contraseña...');
});

createAccountLink.addEventListener('click', function(e) {
    e.preventDefault();
    alert('Redirigiendo a página de registro...');
});