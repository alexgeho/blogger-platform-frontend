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

const createPostSubmitBtn = document.getElementById('createPostSubmitBtn');
const cancelEditPostBtn = document.getElementById('cancelEditPostBtn');

/** Текущий выбранный блог (для загрузки постов). */
let currentBlogId = null;

/** ID поста в режиме редактирования; null — форма в режиме создания. */
let editingPostId = null;

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
   CREATE / EDIT POST (одна форма выше списка)
======================= */

/** Сбрасывает режим редактирования: форма снова для создания поста. */
function clearEditPostMode() {
  editingPostId = null;
  createPostForm.reset();
  createPostSubmitBtn.textContent = 'Create post';
  cancelEditPostBtn.hidden = true;
}

createPostForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentBlogId) return;

  const formData = new FormData(createPostForm);
  const dto = {
    title: formData.get('title'),
    shortDescription: formData.get('shortDescription'),
    content: formData.get('content'),
  };

  if (editingPostId) {
    // Режим редактирования: бэкенд требует blogId в теле запроса
    await updatePost(editingPostId, { ...dto, blogId: currentBlogId });
    showNotice('Post updated');
    clearEditPostMode();
    await loadPosts(currentBlogId);
  } else {
    // Режим создания
    await createPost(currentBlogId, dto);
    showNotice('Post created');
    createPostForm.reset();
    await loadPosts(currentBlogId);
  }
});

/** Отмена редактирования — форма возвращается в режим создания. */
cancelEditPostBtn.addEventListener('click', () => {
  clearEditPostMode();
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
    openBtn.className = 'btn-posts';
    openBtn.onclick = () => selectBlog(blog, li);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'btn-delete';
    deleteBtn.onclick = async () => {
      if (!confirm('Delete this blog?')) return;

      await deleteBlog(blog.id);
      showNotice('Blog deleted');
      resetPosts(blog.id);
      // После подтверждения удаления обновляем список блогов
      loadBlogs();
    };

    actions.append(openBtn, deleteBtn);
    li.append(title, actions);

    // Клик по всей карточке блога — то же, что по кнопке «Posts» (кроме клика по Delete)
    li.addEventListener('click', (e) => {
      if (e.target.closest('.btn-delete')) return;
      selectBlog(blog, li);
    });

    blogsList.appendChild(li);
  });
}

/* =======================
   SELECT BLOG
======================= */
async function selectBlog(blog, li) {
  currentBlogId = blog.id;
  // При смене блога выходим из режима редактирования поста
  clearEditPostMode();

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
    const postLink = document.createElement('a');
    postLink.href = `/src/post/post.html?id=${post.id}`;
    postLink.textContent = post.title;
    postLink.className = 'post-item-link';
    title.appendChild(postLink);

    const actions = document.createElement('div');
    actions.className = 'post-actions';

    // Редактирование: подставляем данные поста в форму выше, переключаем кнопку на «Update»
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => {
      editingPostId = post.id;
      createPostForm.elements.title.value = post.title;
      createPostForm.elements.shortDescription.value = post.shortDescription ?? '';
      createPostForm.elements.content.value = post.content ?? '';
      createPostSubmitBtn.textContent = 'Update';
      cancelEditPostBtn.hidden = false;
      createPostForm.hidden = false;
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = async () => {
      if (!confirm('Delete this post?')) return;

      await deletePost(post.id);
      showNotice('Post deleted');
      // После подтверждения удаления обновляем список постов
      await loadPosts(blogId);
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