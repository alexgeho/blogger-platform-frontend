// src/auth/login.mjs
// Обработка отправки формы логина. Редирект не делаем — только обновляем кнопки в шапке.

import { updateHeaderAuthState } from './ui.mjs';

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const loginOrEmail = loginForm.loginOrEmail.value;
  const password = loginForm.password.value;

  try {
    const res = await fetch('http://localhost:5077/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ loginOrEmail, password }),
    });

    if (!res.ok) {
      throw new Error('Login failed');
    }

    const data = await res.json();

    // Сохраняем токен
    localStorage.setItem('accessToken', data.accessToken);

    // Закрываем форму логина
    loginForm.classList.remove('open');

    // Обновляем шапку: показываем Admin, скрываем Login/Register (без редиректа)
    updateHeaderAuthState();
  } catch (err) {
    alert(err.message);
  }
});
