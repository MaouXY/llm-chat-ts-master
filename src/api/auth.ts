import { http } from './http';
import type { ChildLoginDTO, ResultLoginVO } from '../types/auth';

// 用户登录接口
export const login = (params: {
  username: string;
  password: string;
}) => {
  return http.post<{ token: string; userInfo: any }>('/auth/login', params);
};

// 儿童登录接口
export const childLogin = (params: ChildLoginDTO) => {
  return http.post<ResultLoginVO>('/api/child/login', params);
};

// 用户注册接口
export const register = (params: {
  username: string;
  password: string;
  email: string;
}) => {
  return http.post<{ userId: string }>('/auth/register', params);
};

// 刷新token接口
export const refreshToken = () => {
  return http.post<{ token: string }>('/auth/refresh');
};

// 退出登录接口
export const logout = () => {
  return http.post('/auth/logout');
};

// 获取用户信息接口
export const getUserInfo = () => {
  return http.get<any>('/auth/userInfo');
};

// 发送验证码接口
export const sendVerificationCode = (email: string) => {
  return http.post('/auth/sendCode', { email });
};