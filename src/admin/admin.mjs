import '../styles/main.scss';

import { createBlog, getBlogs, deleteBlog } from './admin.blogs.api.mjs';
import { createPost, getPostsByBlog } from './admin.posts.api.mjs';

/* ACCESS GUARD */
if (!localStorage.getItem('accessToken')) {
  window.location.href = '/';
}

/* DOM */
const blogsList = document.getElementById('adminBlogsList');
const postsList = document.getElementById('adminPostsList');

const createBlogBtn = document.getElementById('createBlogBtn');
const createBlogForm = document.getElementById('createBlogForm');
const createPostForm = document.getElementById('createPostForm');

const logoutBtn = document.getElementById('logoutBtn');
const blogNotice = document.getElementById('blogNotice');

const postsTitle = document.getElementById('postsTitle');
const postsSubtitle = document.getElementById('postsSubtitle');

let currentBlogId = null;

/* LOGOUT */
logoutBtn.addEventListener('click', () => {
  localStorage.clear();
  window.location.href = '/';
});

/* CREATE BLOG */
createBlogBtn.addEventListener('click', () => {
  createBlogForm.hidden = false;
  createBlogForm.scrollIntoView({ behavior: 'smooth' });
});

createBlogForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(createBlogForm);

  await createBlog({
    name: formData.get('name'),
    description: formData.get('description'),
    websiteUrl: formData.get('websiteUrl'),
  });

  showBlogNotice('Blog created');
  createBlogForm.reset();
  createBlogForm.hidden = true;
  loadBlogs();
});

/* CREATE POST */
createPostForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentBlogId) return;

  const formData = new FormData(createPostForm);

  await createPost(currentBlogId, {
    title: formData.get('title'),
    shortDescription: formData.get('shortDescription'),
    content: formData.get('content'),
  });

  showBlogNotice('Post created');
  createPostForm.reset();
  loadPosts(currentBlogId);
});

/* LOAD BLOGS */
async function loadBlogs() {
  const data = await getBlogs();
  blogsList.innerHTML = '';

  data.items.forEach((blog) => {
    const li = document.createElement('li');
    li.className = 'blog-item';

    const title = document.createElement('div');
    title.className = 'blog-title';
    title.textContent = blog.name;

    const actions = document.createElement('div');
    actions.className = 'blog-actions';

    const createPostBtn = document.createElement('button');
    createPostBtn.textContent = 'Create post';
    createPostBtn.onclick = async () => {
      selectBlog(blog, li);
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = async () => {
      await deleteBlog(blog.id);
      showBlogNotice('Blog deleted');
      resetPostsIfDeleted(blog.id);
      loadBlogs();
    };

    actions.append(createPostBtn, deleteBtn);
    li.append(title, actions);
    blogsList.appendChild(li);
  });
}

/* SELECT BLOG */
async function selectBlog(blog, li) {
  currentBlogId = blog.id;

  document
    .querySelectorAll('.blog-item')
    .forEach((el) => el.classList.remove('active'));

  li.classList.add('active');

  postsTitle.textContent = `Posts for: ${blog.name}`;
  postsSubtitle.hidden = true;

  createPostForm.hidden = false;
  await loadPosts(blog.id);
}

/* LOAD POSTS */
async function loadPosts(blogId) {
  const data = await getPostsByBlog(blogId);
  postsList.innerHTML = '';

  data.items.forEach((post) => {
    const li = document.createElement('li');
    li.textContent = post.title;
    postsList.appendChild(li);
  });
}

/* RESET POSTS */
function resetPostsIfDeleted(blogId) {
  if (currentBlogId === blogId) {
    currentBlogId = null;
    postsList.innerHTML = '';
    createPostForm.hidden = true;
    postsTitle.textContent = 'Posts';
    postsSubtitle.hidden = false;
  }
}

/* NOTICE */
function showBlogNotice(message) {
  blogNotice.textContent = message;
  blogNotice.hidden = false;
  setTimeout(() => (blogNotice.hidden = true), 2000);
}

/* INIT */
loadBlogs();