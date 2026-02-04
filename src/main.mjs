// src/main.mjs

// UI / auth side effects
import './auth/ui.mjs';
import './auth/register.mjs';

// API
import { blogsApi } from './api/blogs.api';
import { postsApi } from './api/posts.api';

/* =======================
   GLOBAL STATE
======================= */

const state = {
  activeBlogId: null, // null = all posts
};

/* =======================
   DOM REFERENCES
======================= */

const blogsSection = document.getElementById('blogs');
const blogsList = document.getElementById('blogsList');

const postsSection = document.getElementById('posts');
const postsList = document.getElementById('postsList');

/* =======================
   BLOGS
======================= */

async function loadBlogs() {
  const blogs = await blogsApi.getAll();

  blogsList.innerHTML = '';

  // All posts
  const allItem = document.createElement('li');
  allItem.textContent = 'All posts';
  allItem.style.cursor = 'pointer';

  allItem.onclick = () => {
    state.activeBlogId = null;
    loadPosts();
  };

  blogsList.appendChild(allItem);

  blogs.items.forEach(blog => {
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
    ? await postsApi.getByBlogId(state.activeBlogId)
    : await postsApi.getAll();

  postsList.innerHTML = '';

  posts.items.forEach(post => {
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
