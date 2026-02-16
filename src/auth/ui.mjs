// src/auth/ui.mjs
// Управление шапкой: Login/Register при неавторизованном пользователе, Admin и ник — при авторизованном.

import { getMe } from './me.mjs';

const toggleLogin = document.getElementById('toggleLogin');
const toggleRegister = document.getElementById('toggleRegister');
const adminLink = document.getElementById('adminLink');
const userNicknameEl = document.getElementById('userNickname');

/**
 * Обновляет видимость кнопок в шапке по состоянию авторизации.
 * Не авторизован: показываем Login и Register, скрываем Admin и ник.
 * Авторизован: скрываем Login и Register, показываем ник и Admin.
 */
export async function updateHeaderAuthState() {
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

  if (userNicknameEl) {
    if (isLoggedIn) {
      try {
        const me = await getMe();
        userNicknameEl.textContent = me.login ?? '';
        userNicknameEl.classList.remove('hidden');
      } catch {
        userNicknameEl.classList.add('hidden');
        userNicknameEl.textContent = '';
      }
    } else {
      userNicknameEl.classList.add('hidden');
      userNicknameEl.textContent = '';
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
