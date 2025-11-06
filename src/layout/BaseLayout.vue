<template>
  <div class="font-sans bg-gray-900 text-white min-h-screen flex flex-col">
    <!-- 顶部导航 -->
    <header class="bg-gray-800 py-4 px-6 shadow-md">
      <div class="container mx-auto flex justify-between items-center">
        <div class="flex items-center space-x-3">
          <i class="fa fa-mobile text-3xl text-primary"></i>
          <h1 class="text-xl font-bold">CareSync AI 儿童端演示界面</h1>
        </div>
        <div class="flex items-center space-x-4">
          <button @click="toggleTheme" class="p-2 rounded-full hover:bg-gray-700 transition-custom">
            <i class="fa text-xl" :class="isDarkTheme ? 'fa-sun-o' : 'fa-moon-o'"></i>
          </button>
          <button @click="toggleFullscreen" class="p-2 rounded-full hover:bg-gray-700 transition-custom">
            <i class="fa fa-expand text-xl"></i>
          </button>
        </div>
      </div>
    </header>

    <!-- 控制按钮区 -->
    <div class="container mx-auto px-6 py-4 flex flex-wrap gap-2 justify-center">
      <button 
        @click="navigateTo('login')" 
        :class="['nav-btn px-4 py-2 text-white rounded-lg shadow transition-custom', 
                currentRoute === 'login' ? 'bg-primary hover:bg-primary/90' : 'bg-gray-700 hover:bg-gray-600']"
      >
        <i class="fa fa-sign-in mr-2"></i> 登录页面
      </button>
      <button 
        @click="navigateTo('home')" 
        :class="['nav-btn px-4 py-2 text-white rounded-lg shadow transition-custom', 
                currentRoute === 'home' ? 'bg-primary hover:bg-primary/90' : 'bg-gray-700 hover:bg-gray-600']"
      >
        <i class="fa fa-home mr-2"></i> 聊天主页
      </button>
      <button 
        @click="navigateTo('digitalPerson')" 
        :class="['nav-btn px-4 py-2 text-white rounded-lg shadow transition-custom', 
                currentRoute === 'digitalPerson' ? 'bg-primary hover:bg-primary/90' : 'bg-gray-700 hover:bg-gray-600']"
      >
        <i class="fa fa-video-camera mr-2"></i> 数字人对话
      </button>
      <div class="ml-auto flex items-center gap-4">
        <label class="flex items-center space-x-2">
          <input type="checkbox" v-model="showBrowserUI" class="form-checkbox rounded text-primary">
          <span>显示浏览器UI</span>
        </label>
      </div>
    </div>

    <!-- 主要内容区域 - 手机原型展示 -->
    <main class="container mx-auto flex-1 flex items-center justify-center p-4">
      <!-- 竖向长方形框 - 模拟手机 -->
      <div class="phone-frame rounded-[50px] bg-gray-100 relative overflow-hidden w-[375px] h-[812px] flex flex-col">
        <!-- 浏览器UI (可隐藏) -->
        <div v-if="showBrowserUI" class="bg-gray-800 text-white text-xs py-2 px-4 flex items-center space-x-2">
          <div class="w-3 h-3 rounded-full bg-red-500"></div>
          <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div class="w-3 h-3 rounded-full bg-green-500"></div>
          <div class="flex-1 text-center">CareSync AI 儿童端</div>
        </div>

        <!-- 屏幕内容区域 -->
        <div class="flex-1 overflow-hidden">
          <!-- 路由视图 -->
          <router-view></router-view>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 响应式数据
const isDarkTheme = ref(true)
const showBrowserUI = ref(true)

// 计算当前路由
const currentRoute = computed(() => {
  return route.name?.toString() || 'login'
})

// 方法
const toggleTheme = () => {
  isDarkTheme.value = !isDarkTheme.value
  // 这里可以添加主题切换的逻辑
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }
}

const navigateTo = (routeName: string) => {
  router.push({ name: routeName })
}
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css');

.transition-custom {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.phone-frame {
  box-shadow: 0 0 0 16px #111, 0 0 0 18px #333, 0 10px 30px rgba(0,0,0,0.4);
}

/* 确保Tailwind CSS类正常工作 */
:global(.bg-primary) {
  background-color: #10B981 !important;
}

:global(.text-primary) {
  color: #10B981 !important;
}

:global(.bg-accent) {
  background-color: #F97316 !important;
}

:global(.text-accent) {
  color: #F97316 !important;
}

:global(.bg-neutral) {
  background-color: #6B7280 !important;
}

:global(.text-neutral) {
  color: #6B7280 !important;
}

:global(.bg-light) {
  background-color: #F3F4F6 !important;
}

:global(.text-light) {
  color: #F3F4F6 !important;
}

:global(.bg-dark) {
  background-color: #1F2937 !important;
}

:global(.text-dark) {
  color: #1F2937 !important;
}

:global(.bg-aiMessage) {
  background-color: #EBF4FF !important;
}

:global(.bg-userMessage) {
  background-color: #E6FFFA !important;
}

:global(.message-bubble-left) {
  border-radius: 18px 18px 18px 4px !important;
}

:global(.message-bubble-right) {
  border-radius: 18px 18px 4px 18px !important;
}
</style>