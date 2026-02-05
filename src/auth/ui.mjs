console.log('ui.mjs loaded');


document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  const toggleLogin = document.getElementById('toggleLogin');
  const toggleRegister = document.getElementById('toggleRegister');

  if (!loginForm || !registerForm || !toggleLogin || !toggleRegister) {
    console.error('Auth elements not found');
    return;
  }

  toggleLogin.onclick = () => {
    loginForm.classList.toggle('open');
    registerForm.classList.remove('open');
  };

  toggleRegister.onclick = () => {
    registerForm.classList.toggle('open');
    loginForm.classList.remove('open');
  };
});


// src/auth/ui.mjs

const adminLink = document.getElementById('adminLink');

if (adminLink) {
  if (localStorage.getItem('accessToken')) {
    adminLink.classList.remove('hidden');
  } else {
    adminLink.classList.add('hidden');
  }
}

