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

export async function getPostById(postId) {
  const token = localStorage.getItem('accessToken');
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}/posts/${postId}`, { headers });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Post not found');
    throw new Error('Failed to load post');
  }

  return res.json();
}

/**
 * Поставить Like / Dislike / None (только для залогиненных). PUT /posts/:id/like-status
 * @param {string} postId
 * @param {'Like'|'Dislike'|'None'} likeStatus
 */
export async function setPostLikeStatus(postId, likeStatus) {
  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('Unauthorized');

  const res = await fetch(`${BASE_URL}/posts/${postId}/like-status`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ likeStatus }),
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('Unauthorized');
    if (res.status === 404) throw new Error('Post not found');
    throw new Error('Failed to set like status');
  }
}
