// src/post/post.mjs — страница поста

import '../styles/main.scss';
import '../styles/_post.scss';

import { getBlogs } from '../blogs/blogs.api.mjs';
import { getPostById, setPostLikeStatus } from '../posts/posts.api.mjs';
import { getMe } from '../auth/me.mjs';
import {
  getCommentsByPostId,
  createComment,
  updateComment,
  deleteComment,
} from '../comments/comments.api.mjs';

const blogsList = document.getElementById('blogsList');
const breadcrumbs = document.getElementById('breadcrumbs');
const postArticle = document.getElementById('postArticle');
const postTitle = document.getElementById('postTitle');
const postBlogName = document.getElementById('postBlogName');
const postCreatedAt = document.getElementById('postCreatedAt');
const postShortDescription = document.getElementById('postShortDescription');
const postContent = document.getElementById('postContent');
const postLikes = document.getElementById('postLikes');
const likesCountEl = document.getElementById('likesCount');
const dislikesCountEl = document.getElementById('dislikesCount');
const likeIconEl = document.getElementById('likeIcon');
const dislikeIconEl = document.getElementById('dislikeIcon');
const postError = document.getElementById('postError');
const postLoading = document.getElementById('postLoading');

const postCommentsSection = document.getElementById('postCommentsSection');
const commentsAuthNotice = document.getElementById('commentsAuthNotice');
const commentForm = document.getElementById('commentForm');
const commentSubmitBtn = document.getElementById('commentSubmitBtn');
const commentCancelEditBtn = document.getElementById('commentCancelEditBtn');
const commentsList = document.getElementById('commentsList');
const commentsLoading = document.getElementById('commentsLoading');
const commentsError = document.getElementById('commentsError');

const postPageUserNickname = document.getElementById('postPageUserNickname');
const postPageLogin = document.getElementById('postPageLogin');
const postPageRegister = document.getElementById('postPageRegister');
const postPageAdmin = document.getElementById('postPageAdmin');

let currentPostId = null;
let currentUserId = null;
let editingCommentId = null;

function getPostIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Заполняет левую колонку списком блогов (ссылки на список постов блога). */
async function loadBlogs() {
  const data = await getBlogs();
  blogsList.innerHTML = '';

  const allItem = document.createElement('li');
  const allLink = document.createElement('a');
  allLink.href = '/';
  allLink.textContent = 'All posts';
  allItem.appendChild(allLink);
  blogsList.appendChild(allItem);

  data.items.forEach((blog) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `/?blog=${blog.id}`;
    a.textContent = blog.name;
    li.appendChild(a);
    blogsList.appendChild(li);
  });
}

/** Залогинен ли пользователь (токен есть). */
function isLoggedIn() {
  return !!localStorage.getItem('accessToken');
}

/** Загружает текущего пользователя (Nest) для сравнения с commentatorInfo.userId. */
async function loadCurrentUser() {
  if (!isLoggedIn()) return;
  try {
    const me = await getMe();
    currentUserId = me.id ?? null;
  } catch {
    currentUserId = null;
  }
}

/** Обновляет шапку страницы поста: ник + Admin при логине, Login/Register при гостях. */
async function updatePostPageHeader() {
  const loggedIn = isLoggedIn();
  if (postPageLogin) postPageLogin.classList.toggle('hidden', loggedIn);
  if (postPageRegister) postPageRegister.classList.toggle('hidden', loggedIn);
  if (postPageAdmin) {
    postPageAdmin.classList.toggle('hidden', !loggedIn);
    postPageAdmin.href = loggedIn ? '/src/admin/admin.html' : '#';
  }
  if (postPageUserNickname) {
    if (loggedIn) {
      try {
        const me = await getMe();
        postPageUserNickname.textContent = me.login ?? '';
        postPageUserNickname.classList.remove('hidden');
      } catch {
        postPageUserNickname.classList.add('hidden');
        postPageUserNickname.textContent = '';
      }
    } else {
      postPageUserNickname.classList.add('hidden');
      postPageUserNickname.textContent = '';
    }
  }
}

/** Форматирует дату комментария. */
function formatCommentDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Показать ошибку комментариев. */
function showCommentsError(msg) {
  commentsError.textContent = msg ?? '';
  commentsError.hidden = !msg;
}

/** Рендер списка комментариев. */
function renderComments(items) {
  commentsList.innerHTML = '';
  if (!items || items.length === 0) {
    const li = document.createElement('li');
    li.className = 'comments-empty';
    li.textContent = 'Пока нет комментариев.';
    commentsList.appendChild(li);
    return;
  }
  items.forEach((comment) => {
    const li = document.createElement('li');
    li.className = 'comment-item';
    li.dataset.commentId = comment.id;

    const author = comment.commentatorInfo?.userLogin ?? 'Гость';
    const isOwn = currentUserId && comment.commentatorInfo?.userId === currentUserId;

    const header = document.createElement('div');
    header.className = 'comment-header';
    header.innerHTML = `
      <span class="comment-author">${escapeHtml(author)}</span>
      <time class="comment-date" datetime="${comment.createdAt ?? ''}">${formatCommentDate(comment.createdAt)}</time>
    `;
    li.appendChild(header);

    const body = document.createElement('div');
    body.className = 'comment-body';
    body.textContent = comment.content ?? '';
    li.appendChild(body);

    if (isOwn) {
      const actions = document.createElement('div');
      actions.className = 'comment-actions';
      const editBtn = document.createElement('button');
      editBtn.type = 'button';
      editBtn.className = 'comment-btn-edit';
      editBtn.textContent = 'Изменить';
      editBtn.onclick = () => startEditComment(comment);
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'comment-btn-delete';
      deleteBtn.textContent = 'Удалить';
      deleteBtn.onclick = () => doDeleteComment(comment.id);
      actions.append(editBtn, deleteBtn);
      li.appendChild(actions);
    }

    commentsList.appendChild(li);
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function startEditComment(comment) {
  editingCommentId = comment.id;
  commentForm.elements.content.value = comment.content ?? '';
  commentSubmitBtn.textContent = 'Сохранить';
  commentCancelEditBtn.hidden = false;
  commentForm.hidden = false;
}

function cancelEditComment() {
  editingCommentId = null;
  commentForm.reset();
  commentSubmitBtn.textContent = 'Отправить';
  commentCancelEditBtn.hidden = true;
}

async function doDeleteComment(commentId) {
  if (!confirm('Удалить комментарий?')) return;
  try {
    await deleteComment(commentId);
    await loadComments();
  } catch (e) {
    showCommentsError(e.message ?? 'Не удалось удалить');
  }
}

async function loadComments() {
  if (!currentPostId) return;
  commentsLoading.hidden = false;
  commentsError.hidden = true;
  try {
    const data = await getCommentsByPostId(currentPostId, {
      pageNumber: 1,
      pageSize: 50,
      sortBy: 'createdAt',
      sortDirection: 'desc',
    });
    renderComments(data.items ?? []);
  } catch (e) {
    showCommentsError(e.message ?? 'Не удалось загрузить комментарии');
    renderComments([]);
  } finally {
    commentsLoading.hidden = true;
  }
}

/** Рисует хлебные крошки: Главная → Блог → Пост. */
function renderBreadcrumbs(blogId, blogName, postTitleText) {
  breadcrumbs.innerHTML = '';
  breadcrumbs.hidden = false;

  const parts = [
    { label: 'Главная', href: '/' },
    { label: blogName || 'Блог', href: blogId ? `/?blog=${blogId}` : '/' },
    { label: postTitleText, href: null },
  ];

  parts.forEach((p, i) => {
    if (i > 0) {
      const sep = document.createElement('span');
      sep.className = 'breadcrumbs-sep';
      sep.setAttribute('aria-hidden', 'true');
      sep.textContent = '›';
      breadcrumbs.appendChild(sep);
    }
    if (p.href) {
      const a = document.createElement('a');
      a.href = p.href;
      a.textContent = p.label;
      breadcrumbs.appendChild(a);
    } else {
      const span = document.createElement('span');
      span.className = 'breadcrumbs-current';
      span.textContent = p.label;
      breadcrumbs.appendChild(span);
    }
  });
}

/** Обновляет подсветку иконок Like/Dislike по текущему myStatus. */
function updatePostLikeButtons(myStatus) {
  if (likeIconEl) likeIconEl.classList.toggle('active', myStatus === 'Like');
  if (dislikeIconEl) dislikeIconEl.classList.toggle('active', myStatus === 'Dislike');
}

/** Текущий myStatus по подсветке иконок. */
function getCurrentLikeStatus() {
  if (likeIconEl?.classList.contains('active')) return 'Like';
  if (dislikeIconEl?.classList.contains('active')) return 'Dislike';
  return 'None';
}

/** Отправить лайк/дизлайк и обновить данные поста. */
async function handlePostLikeClick(status) {
  if (!currentPostId || !isLoggedIn()) return;
  const icon = status === 'Like' ? likeIconEl : dislikeIconEl;
  if (icon?.classList.contains('loading')) return;
  icon?.classList.add('loading');
  try {
    const currentStatus = getCurrentLikeStatus();
    const newStatus = currentStatus === status ? 'None' : status;
    await setPostLikeStatus(currentPostId, newStatus);
    const post = await getPostById(currentPostId);
    const info = post.extendedLikesInfo ?? {};
    likesCountEl.textContent = info.likesCount ?? 0;
    dislikesCountEl.textContent = info.dislikesCount ?? 0;
    updatePostLikeButtons(info.myStatus ?? 'None');
  } catch {
    // keep current state
  } finally {
    icon?.classList.remove('loading');
  }
}

async function loadPost() {
  const postId = getPostIdFromUrl();

  if (!postId) {
    postLoading.hidden = true;
    postError.hidden = false;
    return;
  }

  try {
    const post = await getPostById(postId);

    postTitle.textContent = post.title;
    postBlogName.textContent = post.blogName ?? '';
    postCreatedAt.textContent = formatDate(post.createdAt);
    postCreatedAt.dateTime = post.createdAt ?? '';
    postShortDescription.textContent = post.shortDescription ?? '';
    postContent.textContent = post.content ?? '';

    const likes = post.extendedLikesInfo;
    postLikes.hidden = false;
    likesCountEl.textContent = likes?.likesCount ?? 0;
    dislikesCountEl.textContent = likes?.dislikesCount ?? 0;
    updatePostLikeButtons(likes?.myStatus ?? 'None');
    if (isLoggedIn()) {
      likeIconEl?.classList.add('clickable');
      dislikeIconEl?.classList.add('clickable');
    } else {
      likeIconEl?.classList.remove('clickable');
      dislikeIconEl?.classList.remove('clickable');
    }

    document.title = `${post.title} — Blogger Platform`;
    renderBreadcrumbs(post.blogId, post.blogName, post.title);
    postArticle.hidden = false;

    currentPostId = post.id;
    postCommentsSection.hidden = false;
    if (isLoggedIn()) {
      commentForm.hidden = false;
      commentsAuthNotice.hidden = true;
    } else {
      commentForm.hidden = true;
      commentsAuthNotice.hidden = false;
    }
    await loadComments();
  } catch {
    postArticle.hidden = true;
    postError.hidden = false;
  } finally {
    postLoading.hidden = true;
  }
}

const COMMENT_MIN_LENGTH = 1;
const COMMENT_MAX_LENGTH = 300;

commentForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!currentPostId) return;
  const content = commentForm.elements.content.value.trim();
  if (!content) return;
  if (content.length < COMMENT_MIN_LENGTH) {
    showCommentsError(`Комментарий не короче ${COMMENT_MIN_LENGTH} символов.`);
    return;
  }
  if (content.length > COMMENT_MAX_LENGTH) {
    showCommentsError(`Комментарий не длиннее ${COMMENT_MAX_LENGTH} символов.`);
    return;
  }
  commentSubmitBtn.disabled = true;
  showCommentsError('');
  try {
    if (editingCommentId) {
      await updateComment(editingCommentId, content);
      cancelEditComment();
    } else {
      await createComment(currentPostId, content);
      commentForm.reset();
    }
    await loadComments();
  } catch (err) {
    showCommentsError(err.message ?? 'Ошибка');
  } finally {
    commentSubmitBtn.disabled = false;
  }
});

commentCancelEditBtn.addEventListener('click', () => {
  cancelEditComment();
});

likeIconEl?.addEventListener('click', () => handlePostLikeClick('Like'));
dislikeIconEl?.addEventListener('click', () => handlePostLikeClick('Dislike'));
likeIconEl?.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePostLikeClick('Like'); } });
dislikeIconEl?.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePostLikeClick('Dislike'); } });

(async function init() {
  await loadCurrentUser();
  await updatePostPageHeader();
  loadBlogs();
  loadPost();
})();
