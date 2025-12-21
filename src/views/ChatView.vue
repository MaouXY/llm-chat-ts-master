<template>
  <div class="chat-view">
    <!-- 头部导航 -->
    <header class="chat-header">
      <div class="header-content">
        <div class="header-left">
          <div class="logo">
            <i class="fa fa-heartbeat"></i>
            <span>CareSync AI</span>
          </div>
          <span class="badge">儿童端</span>
        </div>
        <div class="header-right">

          <div class="user-info">
            <div class="avatar">
              <i class="fa fa-child"></i>
            </div>
            <span class="username">{{ userName }}</span>
          </div>
        </div>
      </div>
    </header>

    <!-- 聊天区域 -->
    <main class="chat-main">
      <div class="chat-container">
        <!-- 聊天头部 -->
        <div class="chat-header-section">
          <div class="ai-info">
            <div class="ai-avatar">
              <i class="fa fa-robot"></i>
            </div>
            <div class="ai-details">
              <h2 class="ai-name">AI 陪伴助手</h2>
              <p class="ai-status">
                <i class="fa fa-circle"></i> 在线
              </p>
            </div>
          </div>
        </div>

        <!-- 聊天消息区域 -->
        <div class="messages-container" ref="messagesContainer">
          <div 
            v-for="message in messages" 
            :key="message.id"
            :class="['message', message.sender]">
            
            <!-- AI消息 -->
            <div v-if="message.sender === 'assistant'" class="message-wrapper ai-message">
              <div class="avatar ai-avatar">
                <i class="fa fa-robot"></i>
              </div>
              <div class="message-content">
                <!-- 根据消息内容是否为空和发送状态显示打字指示器或实际内容 -->
                <div :class="['bubble', 'ai-bubble', { 'typing-indicator': isSending && message.content === '' }]">
                  <template v-if="isSending && message.content === ''">
                    <span></span>
                    <span></span>
                    <span></span>
                  </template>
                  <template v-else>
                    {{ message.content }}
                  </template>
                </div>
                <div class="message-time">
                  {{ formatTime(message.timestamp) }}
                </div>
              </div>
            </div>

            <!-- 用户消息 -->
            <div v-else class="message-wrapper user-message">
              <div class="message-content">
                <div class="bubble user-bubble">
                  {{ message.content }}
                </div>
                <div class="message-time">
                  {{ formatTime(message.timestamp) }}
                </div>
              </div>
              <div class="avatar user-avatar">
                <i class="fa fa-child"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- 快捷回复建议 -->
        <div v-if="showSuggestions" class="suggestions-container">
          <div class="suggestions">
            <button 
              v-for="suggestion in quickSuggestions" 
              :key="suggestion"
              class="suggestion-btn"
              @click="useSuggestion(suggestion)">
              {{ suggestion }}
            </button>
          </div>
        </div>

        <!-- 聊天输入区域 -->
        <div class="input-container">
          <div class="input-wrapper">
            <div class="input-area">
              <textarea
                v-model="userInput"
                @keypress="handleKeyPress"
                placeholder="输入消息..."
                :disabled="isSending"
                rows="1"
                ref="messageInput"
                class="message-input">
              </textarea>
              <div class="input-actions">
                <button class="action-btn">
                  <i class="fa fa-smile-o"></i>
                </button>
                <button class="action-btn">
                  <i class="fa fa-microphone"></i>
                </button>
              </div>
            </div>
            <button 
              @click="sendMessage" 
              :disabled="isSending || !userInput.trim()"
              class="send-btn">
              <i class="fa fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from 'vue';
import { useAuthStore } from '../store/auth';
import { sendChatMessageStream, processStreamResponse, type LocalMessage, convertToApiMessages, createLocalMessageFromResponse } from '../api/chat';

// 响应式数据
const messages = ref<LocalMessage[]>([]);
const userInput = ref('');
const isSending = ref(false);
const messagesContainer = ref<HTMLElement>();
const messageInput = ref<HTMLTextAreaElement>();

// 获取用户信息
const authStore = useAuthStore();
const userName = computed(() => authStore.user?.name || '儿童');

// 快捷回复建议
const quickSuggestions = [
  '我周末想去公园玩',
  '我想学画画',
  '你能给我讲个故事吗？',
  '我今天数学考了95分'
];

// 是否显示建议
const showSuggestions = computed(() => messages.value.length === 0);

// 本地存储键名
const STORAGE_KEY = 'care_sync_chat_messages';

// 滚动到最新消息
const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

// 从本地存储加载消息
const loadMessages = () => {
  try {
    const storedMessages = localStorage.getItem(STORAGE_KEY);
    if (storedMessages) {
      const parsedMessages = JSON.parse(storedMessages, (key, value) => {
        if (key === 'timestamp') {
          return new Date(value);
        }
        return value;
      });
      messages.value = parsedMessages;
    }
  } catch (error) {
    console.error('加载历史消息失败:', error);
  }
};

// 保存消息到本地存储
const saveMessages = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.value));
  } catch (error) {
    console.error('保存消息失败:', error);
  }
};

// 格式化时间
const formatTime = (timestamp: Date) => {
  return timestamp.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};

// 处理键盘事件
const handleKeyPress = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
};

// 使用快捷回复
const useSuggestion = (suggestion: string) => {
  userInput.value = suggestion;
  messageInput.value?.focus();
};

// 发送消息
const sendMessage = async () => {
  const content = userInput.value.trim();
  if (!content || isSending.value) return;

  // 添加用户消息
  const userMessage: LocalMessage = {
    id: Date.now().toString(),
    content,
    sender: 'user',
    timestamp: new Date(),
    type: 'text'
  };
  messages.value.push(userMessage);
  userInput.value = '';
  
  // 保存消息到本地存储
  saveMessages();
  
  // 滚动到底部
  await scrollToBottom();
  
  // 获取AI回复
  isSending.value = true;

  // 创建AI回复消息的占位符
  const aiMessage: LocalMessage = {
    id: `ai-${Date.now()}`,
    content: '',
    sender: 'assistant',
    timestamp: new Date(),
    type: 'text'
  };
  const aiMessageIndex = messages.value.length;
  messages.value.push(aiMessage);
  
  try {
    // 准备请求参数
    const requestData = {
      chatRequest: {
        prompt: content,
        history: convertToApiMessages(messages.value.slice(0, -2)) // 排除当前用户消息和AI占位符
      },
      contentType: 'text',
      sessionId: Date.now().toString(),
      digiSessionId: ''
    };

    // 获取流式响应读取器
    const reader = await sendChatMessageStream(requestData);
    
    // 处理流式响应
    await processStreamResponse(
      reader,
      (content: string) => {
        // 实时更新AI消息内容
        if (messages.value[aiMessageIndex]) {
          // 修复可能的Markdown语法问题
          let processedContent = content;
          processedContent = processedContent.replace(/#\s+#\s+#/g, '###');
          processedContent = processedContent.replace(/#\s+#/g, '##');
          
          messages.value[aiMessageIndex].content += processedContent;
          
          // 确保聊天区域滚动到底部
          setTimeout(() => {
            scrollToBottom();
          }, 0);
        }
      },
      (error: Error) => {
        console.error('流式响应错误:', error);
        // 更新AI消息为错误信息
        if (messages.value[aiMessageIndex]) {
          messages.value[aiMessageIndex].content = `错误: ${error.message}`;
        }
      }
    );
    
    // 流结束，保存完整聊天记录
    saveMessages();
  } catch (error: any) {
    console.error('发送消息失败:', error);
    // 更新AI消息为错误信息
    if (messages.value[aiMessageIndex]) {
      messages.value[aiMessageIndex].content = `发送失败: ${error.message}`;
    }
    saveMessages();
  } finally {
    isSending.value = false;
    await scrollToBottom();
  }
};

// 组件挂载时
onMounted(() => {
  // 加载历史消息
  loadMessages();
  
  // 如果没有历史消息，添加欢迎消息
  if (messages.value.length === 0) {
    const welcomeMessage: LocalMessage = {
      id: 'welcome',
      content: '你好呀！我是你的AI陪伴助手，今天过得怎么样？有什么想和我分享的吗？',
      sender: 'assistant',
      timestamp: new Date(),
      type: 'text'
    };
    messages.value.push(welcomeMessage);
    saveMessages();
  }
  
  scrollToBottom();
});
</script>

<style scoped>
.chat-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
}

/* 头部样式 */
.chat-header {
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 12px 16px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: #10b981;
}

.logo i {
  color: #f97316;
}

.badge {
  background-color: #10b981;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.notification-btn {
  position: relative;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
}

.notification-count {
  position: absolute;
  top: -2px;
  right: -2px;
  background-color: #f97316;
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #10b981;
  color: white;
  font-size: 14px;
}

.username {
  font-weight: 500;
  color: #374151;
}

/* 主内容区域 */
.chat-main {
  flex: 1;
  display: flex;
  justify-content: center;
  padding: 16px;
  overflow: hidden;
}

.chat-container {
  width: 100%;
  max-width: 600px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chat-container * {
  box-sizing: border-box;
}

/* 聊天头部 */
.chat-header-section {
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.ai-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.ai-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.ai-details h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
}

.ai-status {
  margin: 0;
  font-size: 12px;
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 4px;
}

.ai-status i {
  font-size: 8px;
}

/* 消息区域 */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 0; /* 这是关键，确保flex: 1能够正常工作 */
  -webkit-overflow-scrolling: touch; /* iOS平滑滚动 */
  scroll-behavior: smooth;
}

/* 自定义滚动条样式 */
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.messages-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.messages-container::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}

.message-wrapper {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.ai-message {
  justify-content: flex-start;
}

.user-message {
  justify-content: flex-end;
}

.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bubble {
  padding: 12px 16px;
  border-radius: 18px;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
}

.ai-bubble {
  background-color: #ebf4ff;
  color: #374151;
  border-radius: 18px 18px 18px 4px;
}

.user-bubble {
  background-color: #e6fffa;
  color: #374151;
  border-radius: 18px 18px 4px 18px;
}

.message-time {
  font-size: 11px;
  color: #9ca3af;
}

.ai-message .message-time {
  text-align: left;
}

.user-message .message-time {
  text-align: right;
}

/* 打字指示器 */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
}

.typing-indicator span {
  width: 6px;
  height: 6px;
  background-color: #6b7280;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* 快捷回复建议 */
.suggestions-container {
  padding: 0 16px 16px;
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.suggestion-btn {
  background-color: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 16px;
  padding: 8px 16px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-btn:hover {
  background-color: #e5e7eb;
}

/* 输入区域 */
.input-container {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
}

.input-wrapper {
  display: flex;
  align-items: flex-end;
  gap: 12px;
}

.input-area {
  flex: 1;
  position: relative;
}

.message-input {
  width: 100%;
  padding: 12px 48px 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  resize: none;
  font-size: 14px;
  line-height: 1.4;
  min-height: 44px;
  max-height: 120px;
  box-sizing: border-box;
}

.message-input:focus {
  outline: none;
  border-color: #10b981;
  box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
}

.input-actions {
  position: absolute;
  right: 8px;
  bottom: 8px;
  display: flex;
  gap: 4px;
}

.action-btn {
  background: none;
  border: none;
  color: #6b7280;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
}

.action-btn:hover {
  color: #10b981;
}

.send-btn {
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 16px;
}

.send-btn:hover:not(:disabled) {
  background-color: #0d9c6e;
  transform: scale(1.05);
}

.send-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .chat-main {
    padding: 8px;
  }
  
  .message-content {
    max-width: 85%;
  }
  
  .input-wrapper {
    gap: 8px;
  }
  
  .send-btn {
    width: 40px;
    height: 40px;
  }
}
</style>