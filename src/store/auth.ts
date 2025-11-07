import { defineStore } from 'pinia';
import type { AuthState, UserInfo } from '../types/auth';

// 使用Pinia定义认证状态管理
export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    isAuthenticated: false,
    userInfo: null,
    token: localStorage.getItem('token') || null
  }),

  getters: {
    // 获取用户信息
    getUserInfo: (state): UserInfo | null => state.userInfo,
    // 检查是否已认证
    isLoggedIn: (state): boolean => state.isAuthenticated,
    // 获取token
    getToken: (state): string | null => state.token
  },

  actions: {
    // 设置用户信息
    setUserInfo(userInfo: UserInfo) {
      this.userInfo = userInfo;
      this.isAuthenticated = true;
    },

    // 设置token
    setToken(token: string) {
      this.token = token;
      localStorage.setItem('token', token);
    },

    // 登录成功处理
    loginSuccess(userInfo: UserInfo, token: string) {
      this.setToken(token);
      this.setUserInfo(userInfo);
    },

    // 退出登录
    logout() {
      this.isAuthenticated = false;
      this.userInfo = null;
      this.token = null;
      localStorage.removeItem('token');
    },

    // 初始化认证状态（从localStorage恢复）
    initializeAuth() {
      const token = localStorage.getItem('token');
      if (token) {
        this.token = token;
        // 这里可以添加验证token有效性的逻辑
        // 如果token有效，可以设置isAuthenticated为true
        // 暂时设置为false，需要后端验证
        this.isAuthenticated = false;
      }
    }
  }
});