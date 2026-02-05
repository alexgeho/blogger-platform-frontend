// Admin-only API for blogs (Basic Auth)

const BASE_URL = 'http://localhost:5077';

export async function createBlogAdmin(blog) {
  const res = await fetch(`${BASE_URL}/blogs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + btoa('admin:qwerty'),
    },
    body: JSON.stringify(blog),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Create blog failed');
  }

  return res.json();
}
