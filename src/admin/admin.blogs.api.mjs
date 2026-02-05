const BASE_URL = 'http://localhost:5077';

function adminHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: 'Basic ' + btoa('admin:qwerty'),
  };
}

export async function createBlog(blog) {
  const res = await fetch(`${BASE_URL}/blogs`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(blog),
  });

  if (!res.ok) throw new Error('Create blog failed');
  return res.json();
}

export async function getBlogs() {
  const res = await fetch(`${BASE_URL}/blogs`);
  return res.json();
}

export async function deleteBlog(id) {
  await fetch(`${BASE_URL}/blogs/${id}`, {
    method: 'DELETE',
    headers: adminHeaders(),
  });
}
