<template>
  <div id="homeScreen" class="h-full overflow-y-auto">
    <!-- 头部导航 -->
    <header class="bg-white shadow-md py-3 px-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-3">
          <div class="text-primary font-bold text-xl flex items-center">
            <i class="fa fa-heartbeat mr-2 text-accent"></i>
            <span>CareSync AI</span>
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

    <!-- 主要内容区域 -->
    <main class="px-4 py-6">
      <div class="grid grid-cols-1 gap-6">
        <!-- 聊天区域 -->
        <div id="chat" class="bg-white rounded-xl shadow-md overflow-hidden h-[450px] flex flex-col">
          <!-- 聊天头部 -->
          <div class="p-4 border-b border-gray-200">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
                <i class="fa fa-robot text-lg"></i>
              </div>
              <div>
                <h2 class="text-dark font-semibold">AI 陪伴助手</h2>
                <p class="text-xs text-green-500 flex items-center"><i class="fa fa-circle mr-1"></i> 在线</p>
              </div>
            </div>
          </div>

          <!-- 聊天内容区域 -->
          <div class="flex-1 overflow-y-auto p-4 space-y-5" id="chatMessages">
            <!-- 欢迎消息 -->
            <div class="flex items-start space-x-4">
              <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shrink-0 mt-1">
                <i class="fa fa-robot"></i>
              </div>
              <div class="max-w-[80%]">
                <div class="bg-aiMessage message-bubble-left p-4">
                  <p class="text-dark text-base">你好，小明！我是你的AI陪伴助手，今天过得怎么样？有什么想和我分享的吗？</p>
                </div>
                <p class="text-xs text-neutral mt-1">10:30</p>
              </div>
            </div>

            <!-- 用户消息 -->
            <div class="flex items-start justify-end space-x-4">
              <div class="max-w-[80%]">
                <div class="bg-userMessage message-bubble-right p-4">
                  <p class="text-dark text-base">今天我数学考了95分，老师表扬我了！</p>
                </div>
                <p class="text-xs text-neutral mt-1 text-right">10:32</p>
              </div>
              <div class="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0 mt-1">
                <i class="fa fa-child"></i>
              </div>
            </div>

            <!-- AI回复 -->
            <div class="flex items-start space-x-4">
              <div class="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white shrink-0 mt-1">
                <i class="fa fa-robot"></i>
              </div>
              <div class="max-w-[80%]">
                <div class="bg-aiMessage message-bubble-left p-4">
                  <p class="text-dark text-base">太棒了！数学考95分真的很厉害，这说明你最近学习很努力呢！能告诉我你是怎么做到的吗？</p>
                </div>
                <p class="text-xs text-neutral mt-1">10:33</p>
              </div>
            </div>

            <!-- 快捷回复建议 -->
            <div class="flex flex-wrap gap-2 ml-14">
              <button @click="sendSuggestion('我周末想去公园玩')" class="suggestion-btn px-4 py-2 bg-light text-dark text-sm rounded-full hover:bg-gray-200 transition-custom">我周末想去公园玩</button>
              <button @click="sendSuggestion('我想学画画')" class="suggestion-btn px-4 py-2 bg-light text-dark text-sm rounded-full hover:bg-gray-200 transition-custom">我想学画画</button>
              <button @click="sendSuggestion('你能给我讲个故事吗？')" class="suggestion-btn px-4 py-2 bg-light text-dark text-sm rounded-full hover:bg-gray-200 transition-custom">你能给我讲个故事吗？</button>
            </div>
          </div>

          <!-- 聊天输入区域 -->
          <div class="p-4 border-t border-gray-200">
            <div class="flex items-end space-x-2">
              <div class="flex-1 relative">
                <textarea v-model="messageInput" @keydown.enter="sendMessage" rows="1" placeholder="输入消息..."
                          class="w-full p-3 border border-gray-300 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none resize-none transition-custom"></textarea>
                <div class="absolute right-2 bottom-2 flex items-center space-x-1 text-neutral">
                  <button class="text-neutral hover:text-primary transition-custom">
                    <i class="fa fa-smile-o"></i>
                  </button>
                  <button class="text-neutral hover:text-primary transition-custom">
                    <i class="fa fa-microphone"></i>
                  </button>
                </div>
              </div>
              <button @click="sendMessage"
                      class="bg-primary hover:bg-primary/90 text-white p-3 rounded-lg shadow transition-custom transform hover:-translate-y-1 focus:outline-none">
                <i class="fa fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const messageInput = ref('')

const sendMessage = () => {
  if (messageInput.value.trim()) {
    console.log('发送消息:', messageInput.value)
    // 这里可以添加发送消息的逻辑
    messageInput.value = ''
  }
}

const sendSuggestion = (suggestion: string) => {
  messageInput.value = suggestion
  sendMessage()
}
</script>

<style scoped>
.transition-custom {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>