// src/main.js
import { authApi } from './api/auth.api';
import { blogsApi } from './api/blogs.api';
import { postsApi } from './api/posts.api';

/* =======================
   BLOGS & POSTS
======================= */

const blogsSection = document.getElementById('blogs');
const blogsList = document.getElementById('blogsList');

const postsSection = document.getElementById('posts');
const postsList = document.getElementById('postsList');

/* =======================
   LOAD BLOGS
======================= */

async function loadBlogs() {

const blogs = await blogsApi.getAll();
  console.log('BLOGS RESPONSE:', blogs);


  blogsList.innerHTML = '';

  blogs.items.forEach(blog => {
    const li = document.createElement('li');
    li.textContent = blog.name;
    li.style.cursor = 'pointer';

    li.onclick = () => loadPosts(blog.id);

    blogsList.appendChild(li);
  });

  blogsSection.style.display = 'block';
}

/* =======================
   LOAD POSTS FOR BLOG
======================= */

async function loadPosts(blogId) {
const posts = await postsApi.getByBlogId(blogId);

  postsList.innerHTML = '';

  posts.items.forEach(post => {
    const li = document.createElement('li');
    li.textContent = post.title;
    postsList.appendChild(li);
  });

  postsSection.style.display = 'block';
}

/* =======================
   LOGIN / AUTH
======================= */

const loginSection = document.getElementById('login');
const meSection = document.getElementById('me');

const loginInput = document.getElementById('loginInput');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const meResult = document.getElementById('meResult');
const logoutBtn = document.getElementById('logoutBtn');

loginBtn.onclick = async () => {
  try {
    const result = await authApi.login({
      loginOrEmail: loginInput.value,
      password: passwordInput.value,
    });

    localStorage.setItem('accessToken', result.accessToken);
    await loadMe();
  } catch (e) {
    alert('Login failed');
    console.error(e);
  }
};

logoutBtn.onclick = () => {
  localStorage.removeItem('accessToken');
  loginSection.style.display = 'block';
  meSection.style.display = 'none';
};

async function loadMe() {
  const me = await authApi.me();
  meResult.textContent = JSON.stringify(me, null, 2);

  loginSection.style.display = 'none';
  meSection.style.display = 'block';
}

// автологин
if (localStorage.getItem('accessToken')) {
  loadMe().catch(() => {
    localStorage.removeItem('accessToken');
  });
}

/* =======================
   INIT
======================= */

await loadBlogs();