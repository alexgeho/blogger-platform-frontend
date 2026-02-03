// src/api/auth.api.js

import { api } from './baseApi.js';

export const authApi = {
  /**
   * Логин пользователя
   * @param {{ loginOrEmail: string, password: string }} credentials
   */
  login(credentials) {
    return api.post('/auth/login', credentials);
  },

  /**
   * Получение текущего пользователя по access token
   */
  me() {
    return api.get('/auth/me');
  },

  /**
   * Логаут (если у тебя есть такой endpoint)
   * обычно просто удаление токена на клиенте
   */
  logout() {
    localStorage.removeItem('accessToken');
  },
};