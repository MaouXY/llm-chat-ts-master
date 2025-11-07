<template>
  <div class="live-view">
    <!-- 头部导航 -->
    <header class="live-header">
      <div class="header-content">
        <div class="header-left">
          <div class="logo">
            <i class="fa fa-video-camera"></i>
            <span>数字人陪伴</span>
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

    <!-- 数字人视频区域 -->
    <main class="live-main">
      <div class="digital-human-container">
        <!-- 数字人视频显示区域 -->
        <div class="video-section">
          <div class="video-container"><!-- 该true的一个不能少 -->
            <video 
              ref="videoRef" 
              autoplay="true" 
              playsinline="true" 
              class="digital-human-video"
              :class="{ connected: isConnected }"
            ></video>

            <audio ref="audioRef" autoplay playsinline class="audio-hidden"></audio>
            
            <!-- 未连接时的占位图 -->
            <div v-if="!isConnected" class="video-placeholder">
              <div class="placeholder-icon">
                <i class="fa fa-user-circle-o"></i>
              </div>
              <p class="placeholder-text">AI数字人陪伴中...</p>
            </div>
            
            <!-- 连接状态指示 -->
            <div class="connection-status" :class="{ connected: isConnected }">
              <i class="fa" :class="isConnected ? 'fa-circle' : 'fa-circle-o-notch fa-spin'"></i>
              {{ isConnected ? '已连接' : '连接中...' }}
            </div>
          </div>
        </div>

        <!-- 控制按钮区域 -->
        <div class="controls-section">
          <div class="control-buttons">
            <button 
              @click="startConnection" 
              :disabled="controls.startDisabled"
              class="control-btn start-btn"
            >
              <i class="fa fa-play"></i>
              开始对话
            </button>
            <button 
              @click="stopConnection" 
              :disabled="controls.stopDisabled"
              class="control-btn stop-btn"
            >
              <i class="fa fa-stop"></i>
              结束对话
            </button>
          </div>
        </div>

        <!-- 聊天消息区域 -->
        <div class="chat-section">
          <div class="messages-container" ref="messagesContainer">
            <div 
              v-for="message in messages" 
              :key="message.id"
              :class="['message', message.sender]"
            >
              <!-- AI消息 -->
              <div v-if="message.sender === 'ai'" class="message-wrapper ai-message">
                <div class="avatar ai-avatar">
                  <i class="fa fa-robot"></i>
                </div>
                <div class="message-content">
                  <div class="bubble ai-bubble">
                    {{ message.content }}
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

            <!-- 打字指示器 -->
            <div v-if="isSending" class="message-wrapper ai-message">
              <div class="avatar ai-avatar">
                <i class="fa fa-robot"></i>
              </div>
              <div class="message-content">
                <div class="bubble ai-bubble typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
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
                @click="useSuggestion(suggestion)"
              >
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
                  :disabled="isSending || !isConnected"
                  rows="1"
                  ref="messageInput"
                  class="message-input"
                ></textarea>
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
                :disabled="isSending || !userInput.trim() || !isConnected"
                class="send-btn"
              >
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
import { ref, onMounted, nextTick, computed, onUnmounted } from 'vue';
import { useAuthStore } from '../store/auth';
import { sendChatMessage, type LocalMessage, convertToApiMessages, createLocalMessageFromResponse } from '../api/chat';

// WebRTC相关状态
const pc = ref<RTCPeerConnection | null>(null);
const sessionId = ref<number>(0);
const isConnected = ref(false);

// 媒体元素引用
const videoRef = ref<HTMLVideoElement | null>(null);
const audioRef = ref<HTMLAudioElement | null>(null);

// 控制按钮状态
const controls = ref({
  startDisabled: false,
  stopDisabled: true
});

// 聊天相关状态
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
  '你好，数字人！',
  '今天天气怎么样？',
  '你能给我讲个故事吗？',
  '我想学画画'
];

// 是否显示建议
const showSuggestions = computed(() => messages.value.length === 0);

// 本地存储键名
const STORAGE_KEY = 'care_sync_live_messages';

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

// WebRTC连接协商
const negotiate = async () => {
  if (!pc.value) return;
  
  try {
    // 添加音视频轨道
    pc.value.addTransceiver('video', { direction: 'recvonly' });
    pc.value.addTransceiver('audio', { direction: 'recvonly' });
    
    // 创建offer
    const offer = await pc.value.createOffer();
    await pc.value.setLocalDescription(offer);
    
    // 等待ICE收集完成
    await new Promise<void>((resolve) => {
      if (pc.value?.iceGatheringState === 'complete') {
        resolve();
      } else {
        const checkState = () => {
          if (pc.value?.iceGatheringState === 'complete') {
            pc.value?.removeEventListener('icegatheringstatechange', checkState);
            resolve();
          }
        };
        pc.value?.addEventListener('icegatheringstatechange', checkState);
      }
    });
    
    // 发送offer到LiveTalking服务（通过ark代理）
    const offerData = pc.value.localDescription;
    if (!offerData) throw new Error('Local description not available');
    
    const response = await fetch('/ark/offer', {
      body: JSON.stringify({
        sdp: offerData.sdp,
        type: offerData.type,
      }),
      headers: {
        'Content-Type': 'application/json'
      },
      method: 'POST'
    });
    
    if (!response.ok) throw new Error('Failed to send offer');
    
    const answer = await response.json();
    sessionId.value = answer.sessionid;
    
    // 设置远程描述
    await pc.value.setRemoteDescription(answer);
    
    isConnected.value = true;
    controls.value.stopDisabled = false;
    
  } catch (error) {
    console.error('WebRTC negotiation failed:', error);
    alert('连接失败: ' + (error instanceof Error ? error.message : '未知错误'));
    stopConnection();
  }
};

// 开始WebRTC连接
const startConnection = () => {
  const config: RTCConfiguration = {
    iceServers: [
      { urls: ['stun:stun.l.google.com:19302'] },
      { urls: ['stun:stun1.l.google.com:19302'] }
    ]
  };

  pc.value = new RTCPeerConnection(config);

  // 处理接收到的媒体流
  pc.value.addEventListener('track', (evt) => {
    console.log('Track received:', evt.track.kind, evt.streams);
    console.log('Video ref available:', !!videoRef.value);
    console.log('Audio ref available:', !!audioRef.value);
    
    if (evt.track.kind === 'video' && videoRef.value) {
      console.log('Setting video stream to video element');
      videoRef.value.srcObject = evt.streams[0];
      videoRef.value.play().catch(e => console.error('Video play failed:', e));
      console.log('Video stream set successfully');
    } else if (evt.track.kind === 'audio' && audioRef.value) {
      console.log('Setting audio stream to audio element');
      audioRef.value.srcObject = evt.streams[0];
      audioRef.value.play().catch(e => console.error('Audio play failed:', e));
      console.log('Audio stream set successfully');
    }
  });

  controls.value.startDisabled = true;
  negotiate();
};

// 停止WebRTC连接
const stopConnection = () => {
  controls.value.stopDisabled = true;
  controls.value.startDisabled = false;
  isConnected.value = false;
  sessionId.value = 0;
  
  // 关闭peer connection
  setTimeout(() => {
    if (pc.value) {
      pc.value.close();
      pc.value = null;
    }
  }, 500);
};

// 发送消息
const sendMessage = async () => {
  const content = userInput.value.trim();
  if (!content || isSending.value || !isConnected.value) return;

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
  try {
    // 准备请求参数，包含数字人会话ID
    const requestData = {
      chatRequest: {
        prompt: content,
        history: convertToApiMessages(messages.value.slice(0, -1)) // 排除当前用户消息
      },
      contentType: 'text',
      sessionId: Date.now().toString(),
      digiSessionId: sessionId.value.toString() // 使用数字人会话ID
    };

    const response = await sendChatMessage(requestData);
    
    if (response.code === 1) {
      // 添加AI回复消息
      const aiMessage = createLocalMessageFromResponse(response.data.content, 'ai');
      messages.value.push(aiMessage);
      saveMessages();
    } else {
      // 处理业务错误
      const errorMsg = response.msg || `发送失败，错误码：${response.code}`;
      const errorMessage = createLocalMessageFromResponse(`发送失败：${errorMsg}`, 'ai');
      messages.value.push(errorMessage);
      saveMessages();
    }
  } catch (error: any) {
    console.error('发送消息失败:', error);
    // 添加错误消息
    const errorMessage = createLocalMessageFromResponse('发送失败，请检查网络连接或联系管理员', 'ai');
    messages.value.push(errorMessage);
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
      content: '你好！我是你的AI数字人陪伴助手，点击"开始对话"按钮来连接数字人吧！',
      sender: 'ai',
      timestamp: new Date(),
      type: 'text'
    };
    messages.value.push(welcomeMessage);
    saveMessages();
  }
  
  scrollToBottom();
});

// 组件卸载时清理资源
onUnmounted(() => {
  stopConnection();
});
</script>

<style scoped>
.live-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
}

/* 头部样式 - 与ChatView保持一致 */
.live-header {
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

/* 主内容区域 - 根据原型设计调整布局 */
.live-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow: hidden;
}

.digital-human-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.digital-human-container * {
  box-sizing: border-box;
}

/* 视频区域 - 根据原型设计，上面是数字人视频 */
.video-section {
  flex: 0 0 60%;
  background-color: #1f2937;
  position: relative;
  overflow: hidden;
}

.video-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.digital-human-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.digital-human-video.connected {
  opacity: 1;
}

.audio-hidden {
  display: none;
}

.connection-status {
  position: absolute;
  top: 16px;
  right: 16px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 12px;
  border-radius: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.connection-status.connected {
  background-color: rgba(16, 185, 129, 0.8);
}

.connection-status i {
  font-size: 10px;
}

.video-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.placeholder-icon {
  font-size: 80px;
  color: #10b981;
  margin-bottom: 16px;
}

.placeholder-text {
  font-size: 16px;
  color: #d1d5db;
}

/* 控制按钮区域 - 根据原型设计，下面是控制按钮 */
.controls-section {
  flex: 0 0 auto;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.control-buttons {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.control-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
}

.start-btn {
  background-color: #10b981;
  color: white;
}

.start-btn:hover:not(:disabled) {
  background-color: #0d9c6e;
  transform: scale(1.05);
}

.stop-btn {
  background-color: #ef4444;
  color: white;
}

.stop-btn:hover:not(:disabled) {
  background-color: #dc2626;
  transform: scale(1.05);
}

.control-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

/* 聊天区域 - 与ChatView保持一致 */
.chat-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 消息区域 - 与ChatView保持一致 */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 0;
  -webkit-overflow-scrolling: touch;
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

/* 输入区域 - 与ChatView保持一致 */
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

.message-input:disabled {
  background-color: #f3f4f6;
  color: #9ca3af;
  cursor: not-allowed;
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
  .live-main {
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
  
  .video-section {
    flex: 0 0 50%;
  }
}
</style>