// src/auth/login.mjs

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const loginOrEmail = loginForm.loginOrEmail.value;
  const password = loginForm.password.value;

  try {
    const res = await fetch('http://localhost:5077/auth/login', {
      method: 'POST',
      credentials: 'include', // 👈 чтобы refreshToken cookie сохранился
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ loginOrEmail, password }),
    });

    if (!res.ok) {
      throw new Error('Login failed');
    }

    const data = await res.json();

    // accessToken кладём в localStorage
    localStorage.setItem('accessToken', data.accessToken);

    alert('Logged in');
  } catch (err) {
    alert(err.message);
  }
});
