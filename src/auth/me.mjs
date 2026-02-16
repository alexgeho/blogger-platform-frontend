export async function getMe() {
  const token = localStorage.getItem('accessToken');

  const res = await fetch('http://localhost:5077/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error('Unauthorized');
  }

  return res.json();
}
