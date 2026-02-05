const API_URL = 'http://localhost:5077';

/* CREATE POST (через блог — уже есть) */
export async function createPost(blogId, dto) {
  const response = await fetch(`${API_URL}/blogs/${blogId}/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    throw new Error('Failed to create post');
  }

  return response.json();
}

/* GET POSTS BY BLOG */
export async function getPostsByBlog(blogId) {
  const response = await fetch(`${API_URL}/blogs/${blogId}/posts`);

  if (!response.ok) {
    throw new Error('Failed to load posts');
  }

  return response.json();
}

/* UPDATE POST */
export async function updatePost(postId, dto) {
  const response = await fetch(`${API_URL}/posts/${postId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    throw new Error('Failed to update post');
  }
}

/* DELETE POST */
export async function deletePost(postId) {
  const response = await fetch(`${API_URL}/posts/${postId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete post');
  }
}