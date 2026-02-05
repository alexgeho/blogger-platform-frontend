// src/admin/admin.mjs
import '../styles/main.scss';

import {
  createBlog,
  getBlogs,
  deleteBlog,
} from './admin.blogs.api.mjs';

/* =======================
   ACCESS GUARD
======================= */

if (!localStorage.getItem('accessToken')) {
  window.location.href = '/';
}

/* =======================
   DOM REFERENCES
======================= */

const blogsList = document.getElementById('adminBlogsList');
const createBlogBtn = document.getElementById('createBlogBtn');
const createBlogForm = document.getElementById('createBlogForm');
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
   TOGGLE CREATE BLOG FORM
======================= */

createBlogBtn.addEventListener('click', () => {
  createBlogForm.hidden = !createBlogForm.hidden;
});

/* =======================
   CREATE BLOG
======================= */

createBlogForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(createBlogForm);

  const dto = {
    name: formData.get('name'),
    description: formData.get('description'),
    websiteUrl: formData.get('websiteUrl'),
  };

  try {
    await createBlog(dto);
    showToast('Blog created');
    createBlogForm.reset();
    createBlogForm.hidden = true;

    await loadBlogs();
  } catch (err) {
    alert(err?.message || 'Error creating blog');
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
      await deleteBlog(blog.id);
      await loadBlogs();
    });

    li.appendChild(deleteBtn);
    blogsList.appendChild(li);
  });
}

/* =======================
   INIT
======================= */

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.hidden = false;

  setTimeout(() => {
    toast.hidden = true;
  }, 2000);
}

loadBlogs();
