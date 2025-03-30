// Import Firebase services
import { auth } from './firebase.js';

// DOM Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const toggleRegister = document.getElementById('toggle-register');
const toggleLogin = document.getElementById('toggle-login');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');

// Toggle between login and register forms
toggleRegister.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.classList.add('hidden');
  registerForm.classList.remove('hidden');
});

toggleLogin.addEventListener('click', (e) => {
  e.preventDefault();
  registerForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
});

// Handle user login
loginBtn.addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    console.log('User logged in:', userCredential.user);
    // Redirect to chat page after successful login
    window.location.href = 'chat.html';
  } catch (error) {
    console.error('Login error:', error);
    alert(error.message);
  }
});

// Handle user registration
registerBtn.addEventListener('click', async () => {
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const confirmPassword = document.getElementById('reg-confirm').value;

  if (password !== confirmPassword) {
    alert("Passwords don't match!");
    return;
  }

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    console.log('User registered:', userCredential.user);
    // Redirect to profile setup after registration
    window.location.href = 'profile.html';
  } catch (error) {
    console.error('Registration error:', error);
    alert(error.message);
  }
});

// Check auth state on page load
auth.onAuthStateChanged((user) => {
  if (user) {
    // User is signed in
    console.log('User is logged in:', user.email);
    // Redirect to chat if already authenticated
    if (window.location.pathname.endsWith('index.html')) {
      window.location.href = 'chat.html';
    }
  } else {
    // User is signed out
    console.log('User is logged out');
    // Redirect to login if not authenticated
    if (!window.location.pathname.endsWith('index.html')) {
      window.location.href = 'index.html';
    }
  }
});