// src/auth/register.mjs

const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const login = registerForm.login.value;
  const email = registerForm.email.value;
  const password = registerForm.password.value;

  try {
    const res = await fetch('http://localhost:5077/auth/registration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ login, email, password }),
    });

    if (!res.ok) {
      throw new Error('Registration failed');
    }

    alert('Registered');
  } catch (err) {
    alert(err.message);
  }
});
