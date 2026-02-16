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

/** Синхронизирует URL с выбранным блогом (?blog=id) для хлебных крошек и шаринга. */
function updateUrlForBlog(blogId) {
  const url = new URL(window.location.href);
  if (blogId) {
    url.searchParams.set('blog', blogId);
  } else {
    url.searchParams.delete('blog');
  }
  window.history.replaceState({}, '', url.pathname + url.search);
}

/* =======================
   DOM REFERENCES
======================= */

const blogsSection = document.getElementById('blogs');
const blogsList = document.getElementById('blogsList');

const postsSection = document.getElementById('posts');
const postsList = document.getElementById('postsList');

/* Состояние шапки (Login/Register vs Admin) обновляется в auth/ui.mjs при загрузке и после логина */

/* =======================
   BLOGS
======================= */

async function loadBlogs() {
  const blogs = await getBlogs();

  blogsList.innerHTML = '';

  const allItem = document.createElement('li');
  allItem.textContent = 'All posts';
  allItem.style.cursor = 'pointer';
  if (!state.activeBlogId) allItem.classList.add('active');

  allItem.onclick = () => {
    state.activeBlogId = null;
    updateUrlForBlog(null);
    blogsList.querySelectorAll('li').forEach((el) => el.classList.remove('active'));
    allItem.classList.add('active');
    loadPosts();
  };

  blogsList.appendChild(allItem);

  blogs.items.forEach((blog) => {
    const li = document.createElement('li');
    li.textContent = blog.name;
    li.style.cursor = 'pointer';
    if (state.activeBlogId === blog.id) li.classList.add('active');

    li.onclick = () => {
      state.activeBlogId = blog.id;
      updateUrlForBlog(blog.id);
      blogsList.querySelectorAll('li').forEach((el) => el.classList.remove('active'));
      li.classList.add('active');
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
    li.onclick = () => {
      window.location.href = `/src/post/post.html?id=${post.id}`;
    };
    postsList.appendChild(li);
  });

  postsSection.style.display = 'block';
}

/* =======================
   INIT
======================= */

const urlParams = new URLSearchParams(window.location.search);
const blogIdFromUrl = urlParams.get('blog');
if (blogIdFromUrl) state.activeBlogId = blogIdFromUrl;

await loadBlogs();
await loadPosts();