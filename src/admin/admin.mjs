// src/admin/admin.mjs

/* =======================
   ACCESS GUARD
======================= */
// If user is not logged in — kick out from admin page
if (!localStorage.getItem('accessToken')) {
  window.location.href = '/';
}

/* =======================
   API
======================= */

import {
  createBlog,
  getBlogs,
  deleteBlog,
} from './admin.blogs.api.mjs';

/* =======================
   DOM REFERENCES
======================= */

const blogsList = document.getElementById('adminBlogsList');
const createBtn = document.getElementById('createBlogBtn');
const logoutBtn = document.getElementById('logoutBtn');

/* =======================
   LOGOUT
======================= */

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('isLoggedIn');

  window.location.href = '/';
});

/* =======================
   CREATE BLOG
======================= */

createBtn.addEventListener('click', async () => {
  try {
    await createBlog({
      name: 'Admin blog',
      description: 'Created from admin panel',
      websiteUrl: 'https://example.com',
    });

    await loadBlogs();
  } catch (err) {
    alert(err.message);
  }
});

/* =======================
   LOAD BLOGS
======================= */

async function loadBlogs() {
  const data = await getBlogs();

  blogsList.innerHTML = '';

  data.items.forEach((blog) => {
    const li = document.createElement('li');
    li.textContent = blog.name;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';

    deleteBtn.addEventListener('click', async () => {
      if (!confirm('Delete this blog?')) return;

      await deleteBlog(blog.id);
      loadBlogs();
    });

    li.appendChild(deleteBtn);
    blogsList.appendChild(li);
  });
}

/* =======================
   INIT
======================= */

loadBlogs();