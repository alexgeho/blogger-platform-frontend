// src/api/posts.api.js
import { api } from './baseApi';

export const postsApi = {
  getByBlogId(blogId) {
    return api.get(`/blogs/${blogId}/posts`);
  },
};