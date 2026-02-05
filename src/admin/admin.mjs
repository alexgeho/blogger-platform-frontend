import '../styles/main.scss';

import { createBlog, getBlogs, deleteBlog } from './admin.blogs.api.mjs';
import {
  createPost,
  getPostsByBlog,
  updatePost,
  deletePost,
} from './admin.posts.api.mjs';

/* =======================
   ACCESS GUARD (demo)
======================= */
if (!localStorage.getItem('accessToken')) {
  window.location.href = '/';
}

/* =======================
   DOM REFERENCES
======================= */
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

/* =======================
   LOGOUT
======================= */
logoutBtn.addEventListener('click', () => {
  localStorage.clear();
  window.location.href = '/';
});

/* =======================
   CREATE BLOG
======================= */
createBlogBtn.addEventListener('click', () => {
  createBlogForm.hidden = false;
});

createBlogForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(createBlogForm);

  await createBlog({
    name: formData.get('name'),
    description: formData.get('description'),
    websiteUrl: formData.get('websiteUrl'),
  });

  showNotice('Blog created');
  createBlogForm.reset();
  createBlogForm.hidden = true;
  loadBlogs();
});

/* =======================
   CREATE POST
======================= */
createPostForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentBlogId) return;

  const formData = new FormData(createPostForm);

  await createPost(currentBlogId, {
    title: formData.get('title'),
    shortDescription: formData.get('shortDescription'),
    content: formData.get('content'),
  });

  showNotice('Post created');
  createPostForm.reset();
  loadPosts(currentBlogId);
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

    const title = document.createElement('div');
    title.className = 'blog-title';
    title.textContent = blog.name;

    const actions = document.createElement('div');
    actions.className = 'blog-actions';

    const openBtn = document.createElement('button');
    openBtn.textContent = 'Posts';
    openBtn.onclick = () => selectBlog(blog, li);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = async () => {
      if (!confirm('Delete this blog?')) return;

      await deleteBlog(blog.id);
      showNotice('Blog deleted');
      resetPosts(blog.id);
      loadBlogs();
    };

    actions.append(openBtn, deleteBtn);
    li.append(title, actions);
    blogsList.appendChild(li);
  });
}

/* =======================
   SELECT BLOG
======================= */
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

/* =======================
   LOAD POSTS
======================= */
async function loadPosts(blogId) {
  const data = await getPostsByBlog(blogId);
  postsList.innerHTML = '';

  if (!data.items.length) {
    postsList.innerHTML = '<li class="empty">No posts yet</li>';
    return;
  }

  data.items.forEach((post) => {
    const li = document.createElement('li');
    li.className = 'post-item';

    const title = document.createElement('strong');
    title.textContent = post.title;

    const actions = document.createElement('div');
    actions.className = 'post-actions';

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = async () => {
      const newTitle = prompt('New title', post.title);
      if (!newTitle) return;

      await updatePost(post.id, {
        title: newTitle,
        shortDescription: post.shortDescription,
        content: post.content,
      });

      showNotice('Post updated');
      loadPosts(blogId);
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = async () => {
      if (!confirm('Delete this post?')) return;

      await deletePost(post.id);
      showNotice('Post deleted');
      loadPosts(blogId);
    };

    actions.append(editBtn, deleteBtn);
    li.append(title, actions);
    postsList.appendChild(li);
  });
}

/* =======================
   RESET POSTS
======================= */
function resetPosts(blogId) {
  if (currentBlogId === blogId) {
    currentBlogId = null;
    postsList.innerHTML = '';
    createPostForm.hidden = true;
    postsTitle.textContent = 'Posts';
    postsSubtitle.hidden = false;

    document
      .querySelectorAll('.blog-item')
      .forEach((el) => el.classList.remove('active'));
  }
}

/* =======================
   NOTICE
======================= */
function showNotice(text) {
  blogNotice.textContent = text;
  blogNotice.hidden = false;
  setTimeout(() => (blogNotice.hidden = true), 2000);
}

/* =======================
   INIT
======================= */
loadBlogs();