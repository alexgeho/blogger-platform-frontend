// Комментарии к постам — API NestJS (blogger-platform-Nestjs)

const BASE_URL = 'http://localhost:5077';

function authHeaders() {
  const token = localStorage.getItem('accessToken');
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

/**
 * Список комментариев поста GET /posts/:postId/comments
 * @param {string} postId
 * @param {Object} [params] - pageNumber, pageSize, sortBy, sortDirection
 */
export async function getCommentsByPostId(postId, params = {}) {
  const searchParams = new URLSearchParams();
  if (params.pageNumber != null) searchParams.set('pageNumber', String(params.pageNumber));
  if (params.pageSize != null) searchParams.set('pageSize', String(params.pageSize));
  if (params.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params.sortDirection) searchParams.set('sortDirection', params.sortDirection);

  const url = `${BASE_URL}/posts/${postId}/comments${searchParams.toString() ? `?${searchParams}` : ''}`;
  const res = await fetch(url, {
    headers: { ...authHeaders(), Accept: 'application/json' },
  });

  if (!res.ok) {
    if (res.status === 404) throw new Error('Post not found');
    throw new Error('Failed to load comments');
  }
  return res.json();
}

/**
 * Создать комментарий POST /posts/:postId/comments (только для залогиненных)
 */
export async function createComment(postId, content) {
  const token = localStorage.getItem('accessToken');
  if (!token) throw new Error('Войдите в аккаунт');

  const res = await fetch(`${BASE_URL}/posts/${postId}/comments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('Сессия истекла или нужен вход. Войдите в аккаунт снова.');
    if (res.status === 404) throw new Error('Post not found');
    let msg = 'Не удалось создать комментарий';
    try {
      const data = await res.json();
      if (data.errorsMessages?.[0]?.message) msg = data.errorsMessages[0].message;
    } catch (_) {}
    throw new Error(msg);
  }
  return res.json();
}

/**
 * Обновить комментарий PUT /comments/:id (только автор)
 */
export async function updateComment(commentId, content) {
  const res = await fetch(`${BASE_URL}/comments/${commentId}`, {
    method: 'PUT',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content }),
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('Unauthorized');
    if (res.status === 403) throw new Error('Forbidden');
    if (res.status === 404) throw new Error('Comment not found');
    throw new Error('Failed to update comment');
  }
}

/**
 * Удалить комментарий DELETE /comments/:id (только автор)
 */
export async function deleteComment(commentId) {
  const res = await fetch(`${BASE_URL}/comments/${commentId}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });

  if (!res.ok) {
    if (res.status === 401) throw new Error('Unauthorized');
    if (res.status === 403) throw new Error('Forbidden');
    if (res.status === 404) throw new Error('Comment not found');
    throw new Error('Failed to delete comment');
  }
}
