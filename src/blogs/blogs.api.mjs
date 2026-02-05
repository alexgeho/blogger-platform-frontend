// src/blogs/blogs.api.mjs

const BASE_URL = 'http://localhost:5077';

export async function getBlogs() {
  const res = await fetch(`${BASE_URL}/blogs`);

  if (!res.ok) {
    throw new Error('Failed to load blogs');
  }

  return res.json();
}
