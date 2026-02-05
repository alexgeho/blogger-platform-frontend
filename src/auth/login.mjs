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

    // 1️⃣ Save token
    localStorage.setItem('accessToken', data.accessToken);

    // 2️⃣ Redirect immediately
    window.location.href = '/src/admin/admin.html';

  } catch (err) {
    alert(err.message);
  }
});
