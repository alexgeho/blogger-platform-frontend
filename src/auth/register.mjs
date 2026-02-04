// src/auth/register.mjs

const form = document.getElementById('registerForm');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const dto = {
      login: form.login.value,
      email: form.email.value,
      password: form.password.value,
    };

    try {
      const res = await fetch('http://localhost:5077/auth/registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dto),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.message || 'Registration failed');
        return;
      }

      alert('Registration OK. Check email.');
    } catch (e) {
      alert('Network error');
    }
  });
}
