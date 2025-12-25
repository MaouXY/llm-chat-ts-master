import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/ark': {//liveTalking服务
        target: 'http://localhost:8989',
        changeOrigin: true,
        // 路径重写（如果需要）
        rewrite: (path) => path.replace(/^\/ark/, '')
      },
      '/api': {//后端接口
        target: 'http://localhost:8880',
        changeOrigin: true,
        // 不进行路径重写，保留/api前缀
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // 添加CORS相关的头信息
            proxyReq.setHeader('Origin', 'http://localhost:5173');
            proxyReq.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
            proxyReq.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            proxyReq.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
          });
        }
      },
      '/wen': {//文学疗愈接口
        target: 'http://localhost:8888',
        changeOrigin: true,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // 添加CORS相关的头信息
            proxyReq.setHeader('Origin', 'http://localhost:5173');
            proxyReq.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
            proxyReq.setHeader('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            proxyReq.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
          });
        },
        rewrite: (path) => path.replace(/^\/wen/, '')
      }
    }
  }
})