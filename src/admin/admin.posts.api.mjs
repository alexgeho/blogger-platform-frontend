const API_URL = 'http://localhost:5077';

/** Заголовки с Basic-авторизацией для защищённых эндпоинтов (backend — BasicAuthGuard). */
function adminHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + btoa('admin:qwerty'),
  };
}

/* CREATE POST (через блог). Эндпоинт защищён BasicAuthGuard — передаём adminHeaders. */
export async function createPost(blogId, dto) {
  const response = await fetch(`${API_URL}/blogs/${blogId}/posts`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    throw new Error('Failed to create post');
  }

  return response.json();
}

/* GET POSTS BY BLOG — публичный эндпоинт, авторизация не нужна. */
export async function getPostsByBlog(blogId) {
  const response = await fetch(`${API_URL}/blogs/${blogId}/posts`);

  if (!response.ok) {
    throw new Error('Failed to load posts');
  }

  return response.json();
}

/* UPDATE POST. Эндпоинт защищён — передаём Basic-авторизацию. */
export async function updatePost(postId, dto) {
  const response = await fetch(`${API_URL}/posts/${postId}`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify(dto),
  });

  if (!response.ok) {
    throw new Error('Failed to update post');
  }
}

/* DELETE POST. Эндпоинт защищён — передаём Basic-авторизацию. */
export async function deletePost(postId) {
  const response = await fetch(`${API_URL}/posts/${postId}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });

  if (!response.ok) {
    throw new Error('Failed to delete post');
  }
}