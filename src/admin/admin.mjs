// src/admin/admin.mjs

import '../styles/main.scss';


// ====== ACCESS GUARD ======
if (!localStorage.getItem('accessToken')) {
  window.location.href = '/';
}

import {
  createBlog,
  getBlogs,
  deleteBlog,
} from './admin.blogs.api.mjs';

// ====== DOM REFERENCES ======

const blogsList = document.getElementById('adminBlogsList');
const createBtn = document.getElementById('createBlogBtn');
const createForm = document.getElementById('createBlogForm');
const logoutBtn = document.getElementById('logoutBtn');

// ====== LOGOUT ======

logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('isLoggedIn');
  window.location.href = '/';
});

// ====== TOGGLE CREATE FORM ======

createBtn.addEventListener('click', () => {
  createForm.hidden = !createForm.hidden;
});

// ====== CREATE BLOG (FORM SUBMIT) ======

createForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(createForm);

  const dto = {
    name: formData.get('name'),
    description: formData.get('description'),
    websiteUrl: formData.get('websiteUrl'),
  };

  try {
    await createBlog(dto);

    createForm.reset();
    createForm.hidden = true;

    await loadBlogs();
  } catch (err) {
    alert(err.message || 'Error creating blog');
  }
});

// ====== LOAD BLOGS ======

async function loadBlogs() {
  const data = await getBlogs();

  blogsList.innerHTML = '';

  data.items.forEach((blog) => {
    const li = document.createElement('li');
    li.textContent = blog.name;

    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';

    delBtn.addEventListener('click', async () => {
      await deleteBlog(blog.id);
      loadBlogs();
    });

    li.appendChild(delBtn);
    blogsList.appendChild(li);
  });
}

// ====== INIT ======

loadBlogs();