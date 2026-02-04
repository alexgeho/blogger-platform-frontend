// src/main.js
import { authApi } from './api/auth.api';
import { blogsApi } from './api/blogs.api';
import { postsApi } from './api/posts.api';

/* =======================
   GLOBAL STATE
   Single source of truth for UI state
======================= */

const state = {
  activeBlogId: null, // null = show posts from all blogs
};

/* =======================
   DOM REFERENCES
======================= */

const blogsSection = document.getElementById('blogs');
const blogsList = document.getElementById('blogsList');

const postsSection = document.getElementById('posts');
const postsList = document.getElementById('postsList');

const loginSection = document.getElementById('login');
const meSection = document.getElementById('me');

const loginInput = document.getElementById('loginInput');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const meResult = document.getElementById('meResult');
const logoutBtn = document.getElementById('logoutBtn');

/* =======================
   BLOGS
======================= */

async function loadBlogs() {
  const blogs = await blogsApi.getAll();

  blogsList.innerHTML = '';
  
  // "All posts" option resets the filter
  const allPostsItem = document.createElement('li');
  allPostsItem.textContent = 'All posts';
  allPostsItem.style.cursor = 'pointer';

  allPostsItem.onclick = () => {
    state.activeBlogId = null;
    loadPosts();
  };

  blogsList.appendChild(allPostsItem);
  blogs.items.forEach(blog => {
    const li = document.createElement('li');
    li.textContent = blog.name;
    li.style.cursor = 'pointer';

    // Blog click updates global state and reloads posts
    li.onclick = () => {
      state.activeBlogId = blog.id;
      loadPosts();
    };

    blogsList.appendChild(li);
  });

  blogsSection.style.display = 'block';
}

/* =======================
   POSTS
======================= */

async function loadPosts() {
  // Decide which API call to use based on state
  const posts = state.activeBlogId
    ? await postsApi.getByBlogId(state.activeBlogId)
    : await postsApi.getAll();

  postsList.innerHTML = '';

  posts.items.forEach(post => {
    const li = document.createElement('li');
    li.textContent = post.title;
    postsList.appendChild(li);
  });

  postsSection.style.display = 'block';
}

/* =======================
   AUTH
======================= */

loginBtn.onclick = async () => {
  try {
    const result = await authApi.login({
      loginOrEmail: loginInput.value,
      password: passwordInput.value,
    });

    // Access token is stored to persist auth state
    localStorage.setItem('accessToken', result.accessToken);
    await loadMe();
  } catch (e) {
    alert('Login failed');
    console.error(e);
  }
};

logoutBtn.onclick = () => {
  // Clear auth state and return to guest UI
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

/* =======================
   AUTO LOGIN
   Restores session on page reload
======================= */

if (localStorage.getItem('accessToken')) {
  loadMe().catch(() => {
    localStorage.removeItem('accessToken');
  });
}

/* =======================
   INIT
======================= */

// Initial data loading: blogs + global posts feed
await loadBlogs();
await loadPosts();