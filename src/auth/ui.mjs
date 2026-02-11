// src/auth/ui.mjs
// Управление шапкой: Login/Register при неавторизованном пользователе, Admin — при авторизованном.

const toggleLogin = document.getElementById('toggleLogin');
const toggleRegister = document.getElementById('toggleRegister');
const adminLink = document.getElementById('adminLink');

/**
 * Обновляет видимость кнопок в шапке по состоянию авторизации.
 * Не авторизован: показываем Login и Register, скрываем Admin.
 * Авторизован: скрываем Login и Register, показываем Admin.
 */
export function updateHeaderAuthState() {
  const isLoggedIn = !!localStorage.getItem('accessToken');

  if (toggleLogin) {
    if (isLoggedIn) toggleLogin.classList.add('hidden');
    else toggleLogin.classList.remove('hidden');
  }
  if (toggleRegister) {
    if (isLoggedIn) toggleRegister.classList.add('hidden');
    else toggleRegister.classList.remove('hidden');
  }
  if (adminLink) {
    if (isLoggedIn) {
      adminLink.classList.remove('hidden');
      adminLink.setAttribute('href', '/src/admin/admin.html');
    } else {
      adminLink.classList.add('hidden');
      adminLink.removeAttribute('href');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (!loginForm || !registerForm || !toggleLogin || !toggleRegister) {
    console.error('Auth elements not found');
    return;
  }

  // Переключение между формами Login и Register
  toggleLogin.onclick = () => {
    loginForm.classList.toggle('open');
    registerForm.classList.remove('open');
  };

  toggleRegister.onclick = () => {
    registerForm.classList.toggle('open');
    loginForm.classList.remove('open');
  };

  // При загрузке страницы показываем нужные кнопки в шапке
  updateHeaderAuthState();
});
