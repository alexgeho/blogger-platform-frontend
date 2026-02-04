// src/api/posts.api.js
import { api } from './baseApi';

export const postsApi = {
  getAll() {
    return api.get('/posts');
  },

  getByBlogId(blogId) {
    return api.get(`/blogs/${blogId}/posts`);
  },
};