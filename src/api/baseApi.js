// src/api/baseApi.js

const BASE_URL = 'http://localhost:3000'; // NestJS

function getAccessToken() {
  return localStorage.getItem('accessToken');
}

function buildHeaders(customHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };

  const token = getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options.headers),
  });

  // 204 No Content — ничего не парсим
  if (response.status === 204) {
    return null;
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    // если тело пустое или не JSON
  }

  if (!response.ok) {
    const error = {
      status: response.status,
      message: data?.message || 'Request failed',
      errors: data?.errors,
    };
    throw error;
  }

  return data;
}

export const api = {
  get: (path) => request(path),

  post: (path, body) =>
    request(path, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: (path, body) =>
    request(path, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: (path) =>
    request(path, {
      method: 'DELETE',
    }),
};