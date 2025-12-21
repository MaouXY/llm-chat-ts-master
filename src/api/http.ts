import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

// 创建axios实例
const service: AxiosInstance = axios.create({
  timeout: 100000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false // 禁用withCredentials，避免CORS预检请求
});

// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 请求为/wen开头的，添加Authorization头
    if (config.url?.startsWith('/wen')) {
      // 从localStorage获取token
      const token = localStorage.getItem('token1');
      // 只有在有token且不是登录请求时才添加Authorization头
      if (token && config.headers && !config.url?.includes('/child/login')) {
        config.headers.Authorization = `${token}`;
      }
    } else { 
      // 从localStorage获取token
      const token = localStorage.getItem('token');
      // 只有在有token且不是登录请求时才添加Authorization头
      if (token && config.headers && !config.url?.includes('/child/login')) {
        config.headers.Authorization = `${token}`;
      }
    }
    
    // 可以在这里添加loading状态
    // loadingInstance?.show();
    
    return config;
  },
  (error: AxiosError) => {
    // 处理请求错误
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<any>) => {
    // 关闭loading状态
    // loadingInstance?.hide();
    
    // 根据后端约定的响应格式处理
    const { data } = response;
    
    // 后端返回的数据格式为 { code: number, msg: string, data: any }
    // 只有当 code 不为 1 时才抛出错误
    if (data.code !== 1 && data.code !== 200) {
      // 处理业务错误
      handleBusinessError(data.code, data.msg);
      return Promise.reject(new Error(data.msg || '请求失败'));
    }
    
    // 成功时返回完整响应数据
    return data;
  },
  (error: AxiosError) => {
    // 关闭loading状态
    // loadingInstance?.hide();
    
    // 处理网络错误、超时等
    if (error.response) {
      // 服务器返回错误状态码
      switch (error.response.status) {
        case 401:
          // 未授权，清除token并提示用户重新登录
          localStorage.removeItem('token');
          // 在实际应用中，可以通过事件总线或状态管理通知应用跳转到登录页
          window.dispatchEvent(new CustomEvent('unauthorized'));
          break;
        case 403:
          alert('没有权限访问该资源');
          break;
        case 404:
          alert('请求的资源不存在');
          break;
        case 500:
          alert('服务器内部错误');
          break;
        default:
          alert('请求失败，请稍后重试');
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      alert('网络错误，请检查网络连接');
    } else {
      // 请求配置出错
      alert('请求配置错误');
    }
    
    return Promise.reject(error);
  }
);

// 处理业务错误
function handleBusinessError(code: number, message: string): void {
  // 如果是成功的消息，不要显示为错误
  if (message && (message.includes('成功') || message.includes('success'))) {
    console.warn('业务提示:', message);
    return;
  }
  
  switch (code) {
    case 4001:
      // 自定义错误码处理
      alert('用户不存在');
      break;
    case 4002:
      alert('用户名或密码错误');
      break;
    case 4003:
      alert('权限错误');
      break;
    default:
      alert(message || '业务处理失败');
  }
}

// 导出常用的请求方法
export const http = {
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.get(url, config);
  },
  
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.post(url, data, config);
  },
  
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.put(url, data, config);
  },
  
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return service.delete(url, config);
  },
  
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return service.patch(url, data, config);
  }
};

export default service;