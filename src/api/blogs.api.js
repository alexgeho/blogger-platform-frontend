// src/api/blogs.api.js
import { api } from './baseApi';

export const blogsApi = {
  getAll() {
    return api.get('/blogs');
  },

  getById(id) {
    return api.get(`/blogs/${id}`);
  },
};