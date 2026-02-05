const API_URL = 'http://localhost:5077';

export async function createPost(blogId, dto) {
  const response = await fetch(`${API_URL}/blogs/${blogId}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${btoa('admin:qwerty')}`,
    },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    throw new Error('Failed to create post');
  }

  return response.json();
}

export async function getPostsByBlog(blogId) {
  const response = await fetch(`${API_URL}/blogs/${blogId}/posts`);

  if (!response.ok) {
    throw new Error('Failed to load posts');
  }

  return response.json();
}