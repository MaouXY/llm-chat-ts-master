// 儿童登录请求参数
export interface ChildLoginDTO {
  childNo: string;
  verifyCode: string;
}

// 登录响应数据
export interface LoginVO {
  id: number;
  name: string;
  token: string;
  role: number;
}

// 通用响应格式
export interface ResultLoginVO {
  code: number;
  msg: string;
  data: LoginVO;
}

// 用户信息
export interface UserInfo {
  id: number;
  name: string;
  role: number;
}

// 认证状态
export interface AuthState {
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  token: string | null;
}

export default {
  ChildLoginDTO,
  LoginVO,
  ResultLoginVO,
  UserInfo,
  AuthState
};