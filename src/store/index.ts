import { createPinia } from 'pinia';

// 创建Pinia实例
const pinia = createPinia();

export default pinia;

// 导出所有store
export * from './auth';