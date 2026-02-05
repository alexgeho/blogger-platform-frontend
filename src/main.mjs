// src/main.mjs

import './styles/main.scss';

/* =======================
   UI / AUTH SIDE EFFECTS
======================= */

import './auth/ui.mjs';
import './auth/login.mjs';
import './auth/register.mjs';

/* =======================
   API FUNCTIONS
======================= */

import { getBlogs } from './blogs/blogs.api.mjs';
import { getAllPosts, getPostsByBlogId } from './posts/posts.api.mjs';

/* =======================
   GLOBAL STATE
======================= */

const state = {
  activeBlogId: null,
};

/* =======================
   DOM REFERENCES
======================= */

const blogsSection = document.getElementById('blogs');
const blogsList = document.getElementById('blogsList');

const postsSection = document.getElementById('posts');
const postsList = document.getElementById('postsList');

const adminLink = document.getElementById('adminLink');

/* =======================
   ADMIN LINK STATE
======================= */

function updateAdminLink() {
  if (!adminLink) return;

  const isLoggedIn = !!localStorage.getItem('accessToken');

  if (!isLoggedIn) {
    adminLink.classList.add('disabled');
    adminLink.removeAttribute('href');
  } else {
    adminLink.classList.remove('disabled');
    adminLink.setAttribute('href', '/src/admin/admin.html');
  }
}

/* =======================
   BLOGS
======================= */

async function loadBlogs() {
  const blogs = await getBlogs();

  blogsList.innerHTML = '';

  const allItem = document.createElement('li');
  allItem.textContent = 'All posts';
  allItem.style.cursor = 'pointer';

  allItem.onclick = () => {
    state.activeBlogId = null;
    loadPosts();
  };

  blogsList.appendChild(allItem);

  blogs.items.forEach((blog) => {
    const li = document.createElement('li');
    li.textContent = blog.name;
    li.style.cursor = 'pointer';

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
  const posts = state.activeBlogId
    ? await getPostsByBlogId(state.activeBlogId)
    : await getAllPosts();

  postsList.innerHTML = '';

  posts.items.forEach((post) => {
    if (!post.title) return;

    const li = document.createElement('li');
    li.textContent = post.title;
    postsList.appendChild(li);
  });

  postsSection.style.display = 'block';
}

/* =======================
   INIT
======================= */

await loadBlogs();
await loadPosts();
updateAdminLink();