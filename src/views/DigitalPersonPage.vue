<template>
  <div id="digitalPersonScreen" class="h-full overflow-y-auto">
    <!-- 头部导航 -->
    <header class="bg-white shadow-md py-3 px-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-3">
          <div class="text-primary font-bold text-xl flex items-center">
            <i class="fa fa-video-camera mr-2 text-accent"></i>
            <span>数字人陪伴</span>
          </div>
          <span class="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">儿童端</span>
        </div>
        <div class="flex items-center space-x-4">
          <button class="relative text-neutral hover:text-primary transition-custom">
            <i class="fa fa-bell text-xl"></i>
            <span class="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full text-white text-[10px] flex items-center justify-center">3</span>
          </button>
          <div class="relative group">
            <button class="flex items-center space-x-2 focus:outline-none">
              <div class="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <i class="fa fa-child"></i>
              </div>
              <span class="text-dark font-medium">小明</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- 数字人区域 -->
    <main class="px-4 py-6">
      <div class="bg-white rounded-xl shadow-md overflow-hidden">
        <!-- 数字人视频区域 -->
        <div class="relative h-[300px] bg-gray-900">
          <!-- 模拟数字人画面 -->
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="w-40 h-40 bg-primary/20 rounded-full flex items-center justify-center">
              <i class="fa fa-user-circle-o text-primary text-7xl"></i>
            </div>
            <div class="absolute bottom-4 left-0 right-0 text-center text-white">
              <p class="text-lg font-medium">AI数字人陪伴中...</p>
            </div>
          </div>

          <!-- 数字人控制按钮 -->
          <div class="absolute bottom-4 right-4 flex space-x-2">
            <button @click="toggleVideo" class="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-custom">
              <i class="fa" :class="isVideoOn ? 'fa-video-camera' : 'fa-video-slash'"></i>
            </button>
            <button @click="toggleAudio" class="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-custom">
              <i class="fa" :class="isAudioOn ? 'fa-microphone' : 'fa-microphone-slash'"></i>
            </button>
          </div>
        </div>

        <!-- 聊天区域 -->
        <div class="p-4">
          <div class="space-y-4 max-h-[200px] overflow-y-auto">
            <!-- AI消息 -->
            <div class="flex items-start space-x-3">
              <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shrink-0">
                <i class="fa fa-robot text-xs"></i>
              </div>
              <div class="max-w-[80%]">
                <div class="bg-aiMessage message-bubble-left p-3">
                  <p class="text-dark text-sm">你好小明！今天想和我聊些什么呢？</p>
                </div>
              </div>
            </div>

            <!-- 用户消息 -->
            <div class="flex items-start justify-end space-x-3">
              <div class="max-w-[80%]">
                <div class="bg-userMessage message-bubble-right p-3">
                  <p class="text-dark text-sm">我想听个故事！</p>
                </div>
              </div>
              <div class="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                <i class="fa fa-child text-xs"></i>
              </div>
            </div>

            <!-- AI回复 -->
            <div class="flex items-start space-x-3">
              <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white shrink-0">
                <i class="fa fa-robot text-xs"></i>
              </div>
              <div class="max-w-[80%]">
                <div class="bg-aiMessage message-bubble-left p-3">
                  <p class="text-dark text-sm">好的！我给你讲一个关于勇敢小兔子的故事...</p>
                </div>
              </div>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="mt-4 flex items-center space-x-2">
            <div class="flex-1 relative">
              <input v-model="digitalPersonInput" @keydown.enter="sendDigitalPersonMessage" type="text" placeholder="和数字人聊天..."
                     class="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-custom">
              <div class="absolute right-2 top-2 flex items-center space-x-1 text-neutral">
                <button class="text-neutral hover:text-primary transition-custom">
                  <i class="fa fa-smile-o"></i>
                </button>
              </div>
            </div>
            <button @click="sendDigitalPersonMessage"
                    class="bg-primary hover:bg-primary/90 text-white p-3 rounded-lg shadow transition-custom">
              <i class="fa fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- 快捷操作 -->
      <div class="mt-6 grid grid-cols-2 gap-4">
        <button @click="startStoryTime" class="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-custom flex items-center space-x-3">
          <div class="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center text-accent">
            <i class="fa fa-book"></i>
          </div>
          <div class="text-left">
            <p class="text-dark font-medium">故事时间</p>
            <p class="text-xs text-neutral">听精彩故事</p>
          </div>
        </button>
        <button @click="startLearning" class="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-custom flex items-center space-x-3">
          <div class="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
            <i class="fa fa-graduation-cap"></i>
          </div>
          <div class="text-left">
            <p class="text-dark font-medium">学习助手</p>
            <p class="text-xs text-neutral">知识问答</p>
          </div>
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isVideoOn = ref(true)
const isAudioOn = ref(true)
const digitalPersonInput = ref('')

const toggleVideo = () => {
  isVideoOn.value = !isVideoOn.value
}

const toggleAudio = () => {
  isAudioOn.value = !isAudioOn.value
}

const sendDigitalPersonMessage = () => {
  if (digitalPersonInput.value.trim()) {
    console.log('发送数字人消息:', digitalPersonInput.value)
    digitalPersonInput.value = ''
  }
}

const startStoryTime = () => {
  console.log('开始故事时间')
  // 这里可以添加开始故事时间的逻辑
}

const startLearning = () => {
  console.log('开始学习助手')
  // 这里可以添加开始学习助手的逻辑
}
</script>

<style scoped>
.transition-custom {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>