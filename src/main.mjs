// src/main.mjs

/* =======================
   UI / AUTH SIDE EFFECTS
   These files attach event listeners
   to login/register forms and buttons
======================= */

import './auth/ui.mjs';
import './auth/login.mjs';
import './auth/register.mjs';

/* =======================
   API FUNCTIONS (DIRECT FETCH)
======================= */

import { getBlogs } from './blogs/blogs.api.mjs';
import {
  getAllPosts,
  getPostsByBlogId,
} from './posts/posts.api.mjs';

/* =======================
   GLOBAL STATE
======================= */

const state = {
  activeBlogId: null, // null means "all posts"
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

/**
 * Loads blogs list and renders sidebar
 */
async function loadBlogs() {
  const blogs = await getBlogs();

  blogsList.innerHTML = '';

  // "All posts" item
  const allItem = document.createElement('li');
  allItem.textContent = 'All posts';
  allItem.style.cursor = 'pointer';

  allItem.onclick = () => {
    state.activeBlogId = null;
    loadPosts();
  };

  blogsList.appendChild(allItem);

  // Render blogs
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

/**
 * Loads posts depending on selected blog
 */
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

// Initial data load
await loadBlogs();
await loadPosts();
