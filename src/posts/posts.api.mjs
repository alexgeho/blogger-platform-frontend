// src/posts/posts.api.mjs

const BASE_URL = 'http://localhost:5077';

export async function getAllPosts() {
  const res = await fetch(`${BASE_URL}/posts`);

  if (!res.ok) {
    throw new Error('Failed to load posts');
  }

  return res.json();
}

export async function getPostsByBlogId(blogId) {
  const res = await fetch(`${BASE_URL}/blogs/${blogId}/posts`);

  if (!res.ok) {
    throw new Error('Failed to load posts');
  }

  return res.json();
}
