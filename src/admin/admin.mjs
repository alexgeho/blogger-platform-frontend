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
const blogNotice = document.getElementById('blogNotice');

/* =======================
   LOGOUT
======================= */

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('isLoggedIn');
  window.location.href = '/';
});

/* =======================
   OPEN CREATE BLOG FORM
======================= */

createBlogBtn.addEventListener('click', () => {
  createBlogForm.hidden = false;
  createBlogForm.scrollIntoView({ behavior: 'smooth' });
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

    showBlogNotice('Blog created');

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
    li.className = 'blog-item';

    const title = document.createElement('span');
    title.textContent = blog.name;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';

    deleteBtn.addEventListener('click', async () => {
      await deleteBlog(blog.id);
      showBlogNotice('Blog deleted');
      await loadBlogs();
    });

    li.append(title, deleteBtn);
    blogsList.appendChild(li);
  });
}

/* =======================
   BLOG NOTICE (INLINE)
======================= */

function showBlogNotice(message) {
  if (!blogNotice) return;

  blogNotice.textContent = message;
  blogNotice.hidden = false;

  setTimeout(() => {
    blogNotice.hidden = true;
  }, 2000);
}

/* =======================
   INIT
======================= */

loadBlogs();