import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/ark': {//liveTalking服务
        target: 'http://localhost:8081',
        changeOrigin: true,
        // 路径重写（如果需要）
        // rewrite: (path) => path.replace(/^\/ark/, '')
      },
      '/api': {//后端接口
        target: 'http://localhost:8080',
        changeOrigin: true,
        // 路径重写（如果需要）
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})