// 导出axios封装
import { http } from './http';

export { http };

// 可以在这里导出各个业务模块的API
export * from './auth'; // 认证相关API
export * from './chat'; // 聊天相关API