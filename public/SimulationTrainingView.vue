<template>
  <div class="simulation-training">
    <!-- 页眉 -->
    <WorkHeader />
    
    <!-- 主要内容区域 -->
    <main class="simulation-main-content">
      <div class="simulation-container">
        <!-- 页面标题 -->
        <div class="page-header">
          <div class="page-title-section">
            <h1 class="page-title">AI模拟训练</h1>
            <p class="page-subtitle">通过与AI模拟的留守儿童对话，提升您的沟通和服务能力</p>
          </div>
          <div class="page-actions">
            <!-- 训练历史功能已移除 -->
          </div>
        </div>

        <!-- 场景选择界面 -->
        <div v-if="!currentSession" class="scenario-selection">
          <div class="content-card">
            <div class="content-card-header">
              <h2 class="content-card-title">选择训练场景</h2>
              <p class="content-card-description">从以下场景中选择一个开始训练，或创建自定义场景</p>
            </div>
            
            <div class="scenario-grid">
              <div
                v-for="scenario in scenarios"
                :key="scenario.id"
                class="scenario-card"
                :class="`scenario-card-${getDifficultyLevel(scenario.difficulty)}`"
                @click="selectScenario(scenario)"
              >
                <div class="scenario-card-header">
                  <h3 class="scenario-title">{{ scenario.title }}</h3>
                  <a-tag 
                    :color="getDifficultyColor(scenario.difficulty)"
                    class="scenario-difficulty"
                  >
                    {{ scenario.difficulty }}
                  </a-tag>
                </div>
                
                <p class="scenario-description">{{ scenario.description }}</p>
                
                <div class="scenario-meta">
                  <div class="scenario-meta-item">
                    <icon-clock-circle class="scenario-meta-icon" />
                    <span>预计时长: {{ scenario.estimatedDuration }}分钟</span>
                  </div>
                  <div class="scenario-meta-item">
                    <icon-user class="scenario-meta-icon" />
                    <span>适合: {{ getSuitableLevel(scenario.difficulty) }}</span>
                  </div>
                </div>
                
                <div class="scenario-footer">
                  <a-button 
                    type="primary" 
                    @click.stop="startTraining(scenario)"
                    :loading="loading"
                  >
                    <template #icon><icon-play-circle /></template>
                    开始训练
                  </a-button>
                </div>
              </div>
            </div>

            <!-- 创建自定义场景 -->
            <div class="custom-scenario-section">
              <a-button 
                type="outline" 
                class="custom-scenario-btn"
                @click="showCustomScenarioModal = true"
              >
                <template #icon><icon-plus /></template>
                创建自定义场景
              </a-button>
            </div>
          </div>
        </div>

        <!-- 训练会话界面 -->
        <div v-else class="training-session">
          <!-- 训练信息栏 -->
          <div class="session-info-bar">
            <div class="session-info">
              <div class="session-details">
                <h2 class="session-title">训练会话进行中</h2>
                <p class="session-meta">
                  场景: {{ currentSession.scenarioTitle }} | 
                  开始时间: {{ formatSessionTime(currentSession.startTime) }}
                </p>
              </div>
              <div class="session-stats">
                <div class="session-stat">
                  <span class="stat-label">对话轮次</span>
                  <span class="stat-value">{{ messageCount }}</span>
                </div>
                <div class="session-stat">
                  <span class="stat-label">已用时长</span>
                  <span class="stat-value">{{ formatDuration(elapsedTime) }}</span>
                </div>
              </div>
            </div>
            <div class="session-actions">
              <a-button 
                type="outline" 
                @click="showEvaluation = true"
                :disabled="!canEvaluate"
              >
                <template #icon><icon-bar-chart /></template>
                评估结果
              </a-button>
              <a-button 
                type="primary" 
                status="danger"
                @click="endSession"
                :loading="endingSession"
              >
                <template #icon><icon-stop /></template>
                结束训练
              </a-button>
            </div>
          </div>

          <!-- 聊天界面 -->
          <div class="chat-interface">
            <div class="chat-container">
              <!-- 模拟儿童信息 -->
              <div class="chat-header">
                <div class="simulated-child">
                  <div class="child-avatar">
                    <icon-robot />
                  </div>
                  <div class="child-info">
                    <h3 class="child-name">模拟儿童</h3>
                    <p class="child-status">
                      <span class="status-indicator" :class="{ 'status-online': isAiresponding }"></span>
                      {{ airesponding ? 'AI正在思考...' : '等待您的回复' }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- 聊天消息区域 -->
              <div 
                ref="chatMessagesRef"
                class="chat-messages"
                :class="{ 'chat-messages-loading': airesponding }"
              >
                <!-- 欢迎消息 -->
                <div class="message-group system-message">
                  <div class="message-content">
                    <span class="message-text">
                      训练会话开始，您正在与模拟留守儿童对话。请以专业社工的身份开始沟通。
                    </span>
                  </div>
                </div>

                <!-- 消息列表 -->
                <div
                  v-for="message in chatMessages"
                  :key="message.id"
                  class="message-group"
                  :class="`message-group-${message.senderType}`"
                >
                  <div v-if="message.senderType === 'ai'" class="message-avatar">
                    <div class="avatar ai-avatar">
                      <icon-robot />
                    </div>
                  </div>
                  
                  <div class="message-content">
                    <div class="message-bubble" 
                         :class="[
                           `message-bubble-${message.senderType}`,
                           { 'message-bubble-streaming': message.isStreaming }
                         ]">
                      <div v-if="message.isTyping" class="typing-indicator">
                        <span class="typing-dot"></span>
                        <span class="typing-dot"></span>
                        <span class="typing-dot"></span>
                      </div>
                      <div v-else class="message-text">
                        {{ message.content }}
                        
                        <!-- 流式接收中的提示 -->
                        <span v-if="message.isStreaming" class="streaming-indicator">
                          <span class="streaming-dot"></span>
                          <span class="streaming-dot"></span>
                          <span class="streaming-dot"></span>
                        </span>
                        
                        <!-- AI消息显示情感分析和AI指导 -->
                        <div v-if="message.senderType === 'ai' && (message.isStreaming || (message.emotionAnalysis || message.aiGuidance))" class="message-extra-info">
                          <!-- 情感分析 -->
                          <div v-if="message.emotionAnalysis" class="emotion-analysis">
                            <div class="info-label">情感分析：</div>
                            <div class="info-content" v-if="getMessageEmotionAnalysis(message)?.parsed">
                              <div v-for="(emotion, index) in getMessageEmotionAnalysis(message).parsed.detected_emotions" 
                                  :key="index" 
                                  class="emotion-item">
                                <span class="emotion-name">{{ emotion.emotion }}</span>
                                <span class="emotion-confidence">{{ emotion.confidence }}%</span>
                              </div>
                              <div v-if="getMessageEmotionAnalysis(message).parsed.emotion_intensity" 
                                  class="emotion-intensity">
                                情感强度: {{ getMessageEmotionAnalysis(message).parsed.emotion_intensity }}
                              </div>
                            </div>
                            <div v-else class="info-content">
                              {{ getMessageEmotionAnalysis(message)?.text }}
                              <!-- 情感分析流式渲染提示 -->
                              <span v-if="message.isStreaming" class="streaming-indicator">
                                <span class="streaming-dot"></span>
                                <span class="streaming-dot"></span>
                                <span class="streaming-dot"></span>
                              </span>
                            </div>
                          </div>
                          
                          <!-- AI指导 -->
                          <div v-if="message.aiGuidance" class="ai-guidance">
                            <div class="info-label">AI指导：</div>
                            <div class="info-content guidance-content">{{ message.aiGuidance }}
                              <!-- 指导意见流式渲染提示 -->
                              <span v-if="message.isStreaming" class="streaming-indicator">
                                <span class="streaming-dot"></span>
                                <span class="streaming-dot"></span>
                                <span class="streaming-dot"></span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="message-time">
                      {{ formatTime(message.timestamp) }}
                    </div>
                  </div>

                  <div v-if="message.senderType === 'user'" class="message-avatar">
                    <div class="avatar user-avatar">
                      <icon-user />
                    </div>
                  </div>
                </div>
              </div>

              <!-- 消息输入区域 -->
              <div class="chat-input-area">
                <div class="input-container">
                  <a-input
                    v-model="currentMessage"
                    placeholder="请输入您想说的话..."
                    class="message-input"
                    :disabled="airesponding"
                    @press-enter="sendMessage"
                    :maxlength="500"
                    show-word-limit
                  />
                  <a-button
                    type="primary"
                    class="send-button"
                    :disabled="!currentMessage.trim() || airesponding"
                    :loading="sendingMessage"
                    @click="sendMessage"
                  >
                    <template #icon><icon-send /></template>
                    发送
                  </a-button>
                </div>
                <div class="input-tips">
                  <span class="tip-text">
                    <icon-info-circle class="tip-icon" />
                    提示：尝试使用开放式问题建立信任关系，关注儿童的情感需求
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 自定义场景模态框 -->
    <a-modal
      v-model:visible="showCustomScenarioModal"
      title="创建自定义场景"
      :width="600"
      @ok="createCustomScenario"
      @cancel="resetCustomScenarioForm"
      :ok-loading="creatingScenario"
    >
      <a-form :model="customScenarioForm" layout="vertical">
        <a-form-item label="场景标题" required>
          <a-input 
            v-model="customScenarioForm.title" 
            placeholder="请输入场景标题"
            :maxlength="50"
            show-word-limit
          />
        </a-form-item>
        <a-form-item label="场景描述" required>
          <a-textarea 
            v-model="customScenarioForm.description" 
            placeholder="请详细描述这个训练场景的背景和目标"
            :maxlength="200"
            show-word-limit
            :auto-size="{ minRows: 3, maxRows: 5 }"
          />
        </a-form-item>
        <a-form-item label="难度等级" required>
          <a-select v-model="customScenarioForm.difficulty" placeholder="请选择难度等级">
            <a-option value="初级">初级</a-option>
            <a-option value="中级">中级</a-option>
            <a-option value="高级">高级</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="预计时长（分钟）" required>
          <a-input-number 
            v-model="customScenarioForm.estimatedDuration" 
            :min="5" 
            :max="60" 
            placeholder="预计训练时长"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 评估结果模态框 -->
    <a-modal
      v-model:visible="showEvaluation"
      title="训练评估结果"
      :width="800"
      footer=""
    >
      <div v-if="evaluationResult" class="evaluation-content">
        <div class="evaluation-header">
          <div class="overall-score">
            <div class="score-circle" :style="{ '--score': calculateTotalScore(evaluationResult) }">
              <span class="score-value">{{ calculateTotalScore(evaluationResult) }}</span>
              <span class="score-max">/100</span>
            </div>
            <div class="score-label">综合评分</div>
          </div>
          <div class="score-grade" :class="`score-grade-${getScoreGrade(calculateTotalScore(evaluationResult))}`">
            {{ getScoreGradeText(calculateTotalScore(evaluationResult)) }}
          </div>
        </div>

        <div class="evaluation-details">
          <h3 class="details-title">详细评估</h3>
          <div class="details-grid">
            <div class="detail-item">
              <div class="detail-header">
                <span class="detail-category">同理心得分</span>
                <span class="detail-score">{{ evaluationResult.empathyScore || 0 }}/100</span>
              </div>
              <a-progress 
                :percent="evaluationResult.empathyScore || 0" 
                :stroke-color="getScoreColor(evaluationResult.empathyScore || 0)"
                :show-text="false"
                class="detail-progress"
              />
              <p class="detail-feedback">反映您在对话中对儿童情感的理解和回应能力</p>
            </div>
            <div class="detail-item">
              <div class="detail-header">
                <span class="detail-category">沟通能力得分</span>
                <span class="detail-score">{{ evaluationResult.communicationScore || 0 }}/100</span>
              </div>
              <a-progress 
                :percent="evaluationResult.communicationScore || 0" 
                :stroke-color="getScoreColor(evaluationResult.communicationScore || 0)"
                :show-text="false"
                class="detail-progress"
              />
              <p class="detail-feedback">评估您的语言表达和信息传递效果</p>
            </div>
            <div class="detail-item">
              <div class="detail-header">
                <span class="detail-category">问题解决能力得分</span>
                <span class="detail-score">{{ evaluationResult.problemSolvingScore || 0 }}/100</span>
              </div>
              <a-progress 
                :percent="evaluationResult.problemSolvingScore || 0" 
                :stroke-color="getScoreColor(evaluationResult.problemSolvingScore || 0)"
                :show-text="false"
                class="detail-progress"
              />
              <p class="detail-feedback">衡量您帮助儿童解决问题的能力</p>
            </div>
            <div class="detail-item">
              <div class="detail-header">
                <span class="detail-category">情感识别能力得分</span>
                <span class="detail-score">{{ evaluationResult.emotionalRecognitionScore || 0 }}/100</span>
              </div>
              <a-progress 
                :percent="evaluationResult.emotionalRecognitionScore || 0" 
                :stroke-color="getScoreColor(evaluationResult.emotionalRecognitionScore || 0)"
                :show-text="false"
                class="detail-progress"
              />
              <p class="detail-feedback">评估您识别儿童情感状态的准确性</p>
            </div>
          </div>
        </div>

        <div class="evaluation-suggestions">
          <h3 class="suggestions-title">评估反馈</h3>
          <div v-if="evaluationResult.strengths" class="suggestions-list">
            <h4 class="suggestions-subtitle">优点</h4>
            <li v-for="(strength, index) in parseEvaluationStrengths(evaluationResult.strengths).strengths" :key="index" class="suggestion-item">
              <icon-check-circle class="suggestion-icon" />
              <span>{{ strength }}</span>
            </li>
          </div>
          <div v-if="evaluationResult.strengths" class="suggestions-list">
            <h4 class="suggestions-subtitle">不足</h4>
            <li v-for="(weakness, index) in parseEvaluationStrengths(evaluationResult.strengths).weaknesses" :key="index" class="suggestion-item">
              <icon-check-circle class="suggestion-icon" />
              <span>{{ weakness }}</span>
            </li>
          </div>
          <div v-if="evaluationResult.strengths" class="suggestions-list">
            <h4 class="suggestions-subtitle">改进方向</h4>
            <li v-for="(improvement, index) in parseEvaluationStrengths(evaluationResult.strengths).improvements" :key="index" class="suggestion-item">
              <icon-check-circle class="suggestion-icon" />
              <span>{{ improvement }}</span>
            </li>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="modal-footer">
          <a-button type="primary" @click="handleEvaluationConfirm">确定</a-button>
        </div>
      </template>
    </a-modal>

    <!-- 训练历史功能已移除 -->

    <!-- 加载状态 -->
    <a-spin :loading="loading" class="page-loading">
      <div></div>
    </a-spin>

    <!-- 错误信息 -->
    <a-result
      v-if="error"
      status="error"
      :title="error"
      class="error-result"
    >
      <template #extra>
        <a-button type="primary" @click="loadScenarios">重试</a-button>
      </template>
    </a-result>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { 
  IconUser,
  IconClockCircle, 
  IconPlayCircle,
  IconPlus,
  IconStop,
  IconSend,
  IconInfoCircle,
  IconBarChart,
  IconRobot,
  IconCheckCircle
} from '@arco-design/web-vue/es/icon';
//import { message } from '@arco-design/web-vue/es/message';
import type { 
  SimulationScenario, 
  TrainingSession, 
  ChatMessage, 
  TrainingEvaluation 
} from './types';
import { simulationService } from './service';

import WorkHeader from '@/components/layout/WorkHeader.vue';

// 响应式数据
const loading = ref(false);
const error = ref('');
const showCustomScenarioModal = ref(false);
const showEvaluation = ref(false);
const creatingScenario = ref(false);
const endingSession = ref(false);
const sendingMessage = ref(false);
const airesponding = ref(false);
const canEvaluate = ref(false);

// 场景数据
const scenarios = ref<SimulationScenario[]>([]);
const currentSession = ref<TrainingSession | null>(null);
const chatMessages = ref<ChatMessage[]>([]);
const currentMessage = ref('');
const messageCount = ref(0);
const startTime = ref<Date | null>(null);
const elapsedTime = ref(0);
const timer = ref<number | null>(null);

// 自定义场景表单
const customScenarioForm = ref({
  title: '',
  description: '',
  difficulty: '',
  estimatedDuration: 15
});

// 评估结果
const evaluationResult = ref<TrainingEvaluation | null>(null);

/* 训练历史功能已移除 */

// 路由
const router = useRouter();

// 模板引用
const chatMessagesRef = ref<HTMLElement>();

// 计算属性
const isAiresponding = computed(() => airesponding.value);

// 为消息创建计算属性来缓存情感分析解析结果
const getMessageEmotionAnalysis = (message: ChatMessage) => {
  if (!message.emotionAnalysis) return null;
  return getEmotionAnalysisDisplay(message.emotionAnalysis);
};

// 解析情感分析数据的方法
const parseEmotionAnalysis = (emotionAnalysis: any) => {
  if (typeof emotionAnalysis === 'string') {
    try {
      return JSON.parse(emotionAnalysis);
    } catch (error) {
      console.error('Failed to parse emotionAnalysis:', error);
      return null;
    }
  }
  return emotionAnalysis;
};

// 获取情感分析显示文本
const getEmotionAnalysisDisplay = (emotionAnalysis: any) => {
  const parsed = parseEmotionAnalysis(emotionAnalysis);
  if (!parsed) return { text: emotionAnalysis, parsed: null };
  
  if (parsed.detected_emotions && Array.isArray(parsed.detected_emotions)) {
    const emotionsText = parsed.detected_emotions
      .map((e: any) => `${e.emotion}(${e.confidence}%)`)
      .join('、');
    const intensityText = parsed.emotion_intensity ? `情感强度:${parsed.emotion_intensity}` : '';
    return { 
      text: [emotionsText, intensityText].filter(Boolean).join(' | '), 
      parsed: parsed 
    };
  }
  
  return { text: JSON.stringify(parsed), parsed: parsed };
};

// 方法
const loadScenarios = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    scenarios.value = await simulationService.getScenarios();
  } catch (err) {
    error.value = '加载训练场景失败';
    console.error('Failed to load scenarios:', err);
  } finally {
    loading.value = false;
  }
};

const selectScenario = (scenario: SimulationScenario) => {
  //message.info(`已选择场景：${scenario.title}`);
};

const startTraining = async (scenario: SimulationScenario) => {
  loading.value = true;
  
  try {
    currentSession.value = await simulationService.startTrainingSession(scenario.id);
    startTime.value = new Date();
    messageCount.value = 0;
    elapsedTime.value = 0;
    canEvaluate.value = false;
    
    // 初始化聊天记录 - 每次开始训练都清空历史记录
    chatMessages.value = [];
    
    // 开始计时
    startTimer();
    
    //message.success('训练会话已开始');
  } catch (err) {
    //message.error('开始训练失败');
    console.error('Failed to start training:', err);
  } finally {
    loading.value = false;
  }
};



// 流式获取AI回复
const getAIResponseStream = async (userMessage: string) => {
  airesponding.value = true;
  
  // 添加临时AI消息，用于显示实时回复
  const tempAiMessageId = `ai_temp_${Date.now()}`;
  const tempAiMessage: ChatMessage = {
    id: tempAiMessageId,
    content: '',
    senderType: 'ai',
    role: 'ai',
    timestamp: new Date(),
    isTyping: false,
    isStreaming: true, // 添加流式标记
    streamContent: '', // 用于存储完整的流式内容
    emotionAnalysis: undefined,
    aiGuidance: undefined
  };
  
  chatMessages.value.push(tempAiMessage);
  
  // 滚动到底部
  await nextTick();
  scrollToBottom();
  
  try {
    // 调用流式接口
    await simulationService.sendTrainingMessageStream(
      {
        sessionId: currentSession.value!.id,
        prompt: userMessage,
        chatHistory: chatMessages.value
      },
      (chunk) => {
        // 处理流式数据
        if (chunk.choices && chunk.choices.length > 0) {
          const choice = chunk.choices[0];
          if (choice.delta && choice.delta.content) {
            // 更新临时AI消息的内容
            const aiMessageIndex = chatMessages.value.findIndex(msg => msg.id === tempAiMessageId);
            if (aiMessageIndex !== -1) {
              // 将增量内容添加到streamContent中
              chatMessages.value[aiMessageIndex].streamContent += choice.delta.content;
              // 提取streamContent
              const streamContent = chatMessages.value[aiMessageIndex].streamContent;
              
              // 提取儿童回复部分，用于实时显示
              // 使用更宽松的正则表达式，允许不完整的内容
              const childReplyMatch = streamContent.match(/---儿童回复---\n([\s\S]*?)(?=---情感分析---|$)/);
              if (childReplyMatch) {
                chatMessages.value[aiMessageIndex].content = childReplyMatch[1].trim();
              }
              
              // 提取情感分析部分，用于实时显示
              // 使用更宽松的正则表达式，允许不完整的内容
              const emotionAnalysisMatch = streamContent.match(/---情感分析---\n([\s\S]*?)(?=---指导意见---|$)/);
              if (emotionAnalysisMatch) {
                chatMessages.value[aiMessageIndex].emotionAnalysis = emotionAnalysisMatch[1].trim();
              }
              
              // 提取AI指导部分，用于实时显示
              // 使用更宽松的正则表达式，允许不完整的内容
              const aiGuidanceMatch = streamContent.match(/---指导意见---\n([\s\S]*$)/);
              if (aiGuidanceMatch) {
                chatMessages.value[aiMessageIndex].aiGuidance = aiGuidanceMatch[1].trim();
              }
              
              // 滚动到底部
              nextTick(() => scrollToBottom());
            }
          }
        }
      },
      () => {
        // 流式接收完成
        const aiMessageIndex = chatMessages.value.findIndex(msg => msg.id === tempAiMessageId);
        if (aiMessageIndex !== -1) {
          const streamContent = chatMessages.value[aiMessageIndex].streamContent;
          
          // 提取完整的儿童回复、情感分析和指导意见
          const childReplyMatch = streamContent.match(/---儿童回复---\n([\s\S]*?)(?=---情感分析---)/);
          const emotionAnalysisMatch = streamContent.match(/---情感分析---\n([\s\S]*?)(?=---指导意见---)/);
          const aiGuidanceMatch = streamContent.match(/---指导意见---\n([\s\S]*$)/);
          
          // 更新AI消息
          chatMessages.value[aiMessageIndex] = {
            ...chatMessages.value[aiMessageIndex],
            content: childReplyMatch ? childReplyMatch[1].trim() : '',
            emotionAnalysis: emotionAnalysisMatch ? emotionAnalysisMatch[1].trim() : undefined,
            aiGuidance: aiGuidanceMatch ? aiGuidanceMatch[1].trim() : undefined,
            isStreaming: false,
            streamContent: ''
          };
          
          messageCount.value++;
          
          // 保存聊天历史记录到localStorage
          saveChatHistory();
          
          // 滚动到底部
          nextTick(() => scrollToBottom());
        }
        
        console.log("airesponding被重置");
        airesponding.value = false;
        sendingMessage.value = false;
        // AI回复完成后重新开始计时
        startTimer();
      }
    );
  } catch (err) {
    console.log('Failed to get AI response stream:', err);
    airesponding.value = false;
    // 发生错误时重新开始计时
    startTimer();
  }
};

//发送用户消息
const sendMessage = async () => {
  if (!currentMessage.value.trim() || airesponding.value || sendingMessage.value) {
    return;
  }
  
  const userMessage = currentMessage.value.trim();
  currentMessage.value = '';
  sendingMessage.value = true;
  
  // 在发送用户消息期间也停止计时器
  if (timer.value) {
    clearInterval(timer.value);
    timer.value = null;
  }
  
  try {
    // 添加用户消息
    const userChatMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      content: userMessage,
      senderType: 'user',
      role: 'user',
      timestamp: new Date(),
      isTyping: false
    };
    
    chatMessages.value.push(userChatMessage);
    messageCount.value++;
    
    // 保存聊天历史记录到localStorage
    saveChatHistory();
    
    // 滚动到底部
    await nextTick();
    scrollToBottom();
    
    // 检查是否达到评估条件
    if (messageCount.value >= 8 && !canEvaluate.value) {
      canEvaluate.value = true;
      //message.info('已达到评估条件，您可以在右上角查看评估结果');
    }
    
    // 调用流式AI回复（计时器在getAIResponseStream中重新开始）
    await getAIResponseStream(userMessage);
    
  } catch (err) {
    //message.error('发送消息失败');
    console.error('Failed to send message:', err);
    // 发生错误时重新开始计时
    startTimer();
  } finally {
    console("sendingMessage重置");
    sendingMessage.value = false;
  }
};

//结束训练
const endSession = async () => {
  if (!currentSession.value) return;
  
  endingSession.value = true;
  
  try {
    const evaluation = await simulationService.endTrainingSession(currentSession.value.id);
    evaluationResult.value = evaluation;
    
    // 清理定时器
    if (timer.value) {
      clearInterval(timer.value);
      timer.value = null;
    }
    
    //message.success('训练会话已结束');
    showEvaluation.value = true;
    
  } catch (err) {
    //message.error('结束训练失败');
    console.error('Failed to end session:', err);
  } finally {
    endingSession.value = false;
  }
};

// 自定义场景
const createCustomScenario = async () => {
  if (!customScenarioForm.value.title || !customScenarioForm.value.description) {
   // message.warning('请填写完整信息');
    return;
  }
  
  creatingScenario.value = true;
  
  try {
    const newScenario = await simulationService.createScenario(customScenarioForm.value);
    scenarios.value.push(newScenario);
    showCustomScenarioModal.value = false;
    resetCustomScenarioForm();
    //message.success('自定义场景创建成功');
  } catch (err) {
    //message.error('创建场景失败');
    console.error('Failed to create scenario:', err);
  } finally {
    creatingScenario.value = false;
  }
};

// 创建场景表单
const resetCustomScenarioForm = () => {
  customScenarioForm.value = {
    title: '',
    description: '',
    difficulty: '',
    estimatedDuration: 15
  };
};

// 保存聊天记录到localStorage
const saveChatHistory = () => {
  try {
    localStorage.setItem('simulation_chat_history', JSON.stringify(chatMessages.value));
  } catch (error) {
    console.error('保存聊天历史记录失败:', error);
  }
};

/* 训练历史功能已移除 */

// 工具方法
const getDifficultyLevel = (difficulty: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED'): string => {
  const levelMap: Record<string, string> = {
    'BASIC': 'beginner',
    'INTERMEDIATE': 'intermediate', 
    'ADVANCED': 'advanced'
  };
  return levelMap[difficulty] || 'beginner';
};

// 难度颜色映射
const getDifficultyColor = (difficulty: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED'): string => {
  const colorMap: Record<string, string> = {
    'BASIC': 'green',
    'INTERMEDIATE': 'orange',
    'ADVANCED': 'red'
  };
  return colorMap[difficulty] || 'gray';
};

// 难度等级映射
const getSuitableLevel = (difficulty: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED'): string => {
  const levelMap: Record<string, string> = {
    'BASIC': '新手社工',
    'INTERMEDIATE': '有经验社工',
    'ADVANCED': '资深社工'
  };
  return levelMap[difficulty] || '所有级别';
};

// 得分等级映射
const getScoreGrade = (score: number): string => {
  if (score >= 90) return 'excellent';
  if (score >= 80) return 'good';
  if (score >= 70) return 'average';
  return 'poor';
};

// 得分等级文本映射
  const getScoreGradeText = (score: number): string => {
    if (score >= 90) return '优秀';
    if (score >= 80) return '良好';
    if (score >= 70) return '一般';
    return '需要改进';
  };

  // 得分等级颜色映射
  const getScoreColor = (score: number): string => {
    if (score >= 90) return '#22C55E';
    if (score >= 80) return '#10B981';
    if (score >= 70) return '#F59E0B';
    return '#EF4444';
  };

  // 解析评估结果中的优缺点和改进方向
  const parseEvaluationStrengths = (strengths: string): { strengths: string[], weaknesses: string[], improvements: string[] } => {
    const result = {
      strengths: [],
      weaknesses: [],
      improvements: []
    };

    // 匹配优点部分
    const strengthsMatch = strengths.match(/优点：([\s\S]*?)(?=\n不足：|$)/);
    if (strengthsMatch) {
      result.strengths = strengthsMatch[1].split('。').filter(item => item.trim());
    }

    // 匹配不足部分
    const weaknessesMatch = strengths.match(/不足：([\s\S]*?)(?=\n改进方向：|$)/);
    if (weaknessesMatch) {
      result.weaknesses = weaknessesMatch[1].split('。').filter(item => item.trim());
    }

    // 匹配改进方向部分
    const improvementsMatch = strengths.match(/改进方向：([\s\S]*$)/);
    if (improvementsMatch) {
      result.improvements = improvementsMatch[1].split('。').filter(item => item.trim());
    }

    return result;
  };

// 会话时间格式化
const formatSessionTime = (time: Date): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(time));
};

// 时间格式化
const formatTime = (time: Date): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(time));
};

// 日期时间格式化
const formatDateTime = (time: Date): string => {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(time));
};

const formatDuration = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const scrollToBottom = () => {
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight;
  }
};

// 处理评估结果确认
  const handleEvaluationConfirm = () => {
    showEvaluation.value = false;
    // 跳转到工作首页
    router.push('/work-home');
  };

  // 计算总分
  const calculateTotalScore = (evaluation: TrainingEvaluation): number => {
    if (!evaluation) return 0;
    const scores = [
      evaluation.empathyScore || 0,
      evaluation.communicationScore || 0,
      evaluation.problemSolvingScore || 0,
      evaluation.emotionalRecognitionScore || 0
    ];
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  };

const startTimer = () => {
  if (timer.value) {
    clearInterval(timer.value);
  }
  
  timer.value = setInterval(() => {
    if (startTime.value) {
      const now = new Date();
      elapsedTime.value = Math.floor((now.getTime() - startTime.value.getTime()) / 1000);
    }
  }, 1000);
};

// 监听消息变化，自动滚动到底部
watch(() => chatMessages.value.length, () => {
  nextTick(() => {
    scrollToBottom();
  });
});

// 生命周期
onMounted(() => {
  loadScenarios();
  /* 训练历史功能已移除 */
});

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value);
  }
});
</script>

<style scoped>
/* 基础样式 */
.simulation-training {
  min-height: 100vh;
  background: var(--light);
}

.simulation-main-content {
  padding-top: 64px;
  min-height: 100vh;
}

.simulation-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* 页面标题 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  gap: 2rem;
}

.page-title-section {
  flex: 1;
}

.page-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--dark);
  line-height: 1.2;
}

.page-subtitle {
  margin: 0.5rem 0 0 0;
  font-size: 1rem;
  color: var(--neutral);
  line-height: 1.5;
}

.page-actions {
  display: flex;
  gap: 1rem;
}

/* 内容卡片 */
.content-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.content-card-header {
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid #E5E7EB;
}

.content-card-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--dark);
}

.content-card-description {
  margin: 0;
  font-size: 1rem;
  color: var(--neutral);
}

/* 场景选择 */
.scenario-selection {
  animation: fadeIn 0.3s ease-in-out;
}

.scenario-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.scenario-card {
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: white;
}

.scenario-card:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
  transform: translateY(-2px);
}

.scenario-card-beginner:hover {
  border-color: var(--secondary);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.1);
}

.scenario-card-intermediate:hover {
  border-color: var(--warning);
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.1);
}

.scenario-card-advanced:hover {
  border-color: var(--danger);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.1);
}

.scenario-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  gap: 1rem;
}

.scenario-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--dark);
  flex: 1;
}

.scenario-difficulty {
  flex-shrink: 0;
}

.scenario-description {
  margin: 0 0 1.5rem 0;
  font-size: 0.875rem;
  color: var(--neutral);
  line-height: 1.5;
}

.scenario-meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.scenario-meta-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--neutral);
}

.scenario-meta-icon {
  color: var(--primary);
}

.scenario-footer {
  display: flex;
  justify-content: flex-end;
}

.custom-scenario-section {
  padding: 1rem 2rem 2rem 2rem;
  border-top: 1px solid #E5E7EB;
  text-align: center;
}

.custom-scenario-btn {
  border-style: dashed;
}

/* 训练会话 */
.training-session {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: slideIn 0.3s ease-in-out;
}

.session-info-bar {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
}

.session-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 2rem;
  flex: 1;
}

.session-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--dark);
}

.session-meta {
  margin: 0;
  font-size: 0.875rem;
  color: var(--neutral);
}

.session-stats {
  display: flex;
  gap: 2rem;
}

.session-stat {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  color: var(--neutral);
  margin-bottom: 0.25rem;
}

.stat-value {
  display: block;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--primary);
}

.session-actions {
  display: flex;
  gap: 1rem;
}

/* 聊天界面 */
.chat-interface {
  display: flex;
  flex-direction: column;
  height: 100%; /* 继承父容器高度 */
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 75vh;
  max-height: 1200px;
  min-height: 600px;
}

.chat-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #E5E7EB;
  background: #F9FAFB;
}

.simulated-child {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.child-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  font-size: 1.25rem;
}

.child-name {
  margin: 0 0 0.25rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--dark);
}

.child-status {
  margin: 0;
  font-size: 0.875rem;
  color: var(--neutral);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--neutral);
  flex-shrink: 0;
}

.status-indicator.status-online {
  background: var(--secondary);
  animation: pulse 2s infinite;
}

/* 聊天消息区域 */
.chat-messages {
  height: calc(100% - 4.5rem);
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  background: #FAFAFA;
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: var(--light);
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: rgba(79, 70, 229, 0.3);
  border-radius: 3px;
  transition: background 0.2s ease;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: rgba(79, 70, 229, 0.5);
}

.chat-messages-loading {
  opacity: 0.7;
}

/* 消息组 */
.message-group {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  max-width: 100%;
}

.message-group-ai {
  justify-content: flex-start;
}

.message-group-user {
  justify-content: flex-end;
}

.message-group-system {
  justify-content: center;
}

/* 消息头像 */
.message-avatar {
  flex-shrink: 0;
}

.avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  color: white;
}

.ai-avatar {
  background: rgba(249, 115, 22, 0.1);
  color: var(--accent);
}

.user-avatar {
  background: rgba(79, 70, 229, 0.1);
  color: var(--primary);
}

/* 消息内容 */
.message-content {
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.message-bubble {
  padding: 1rem 1.25rem;
  border-radius: 1rem;
  position: relative;
  word-wrap: break-word;
}

.message-bubble-ai {
  background: white;
  color: var(--dark);
  border-bottom-left-radius: 0.25rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.message-bubble-user {
  background: var(--primary);
  color: white;
  border-bottom-right-radius: 0.25rem;
  margin-left: auto;
}

.message-text {
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

.message-time {
  font-size: 0.75rem;
  color: var(--neutral);
  margin-top: 0.5rem;
  text-align: right;
}

/* 系统消息 */
.system-message .message-content {
  max-width: 100%;
}

.system-message .message-bubble {
  background: rgba(107, 114, 128, 0.1);
  color: var(--neutral);
  text-align: center;
  border-radius: 1rem;
}

.system-message .message-text {
  font-size: 0.75rem;
}

/* 打字指示器 */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.typing-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--neutral);
  animation: typing 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-dot:nth-child(2) {
  animation-delay: -0.16s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0s;
}

/* 流式回复指示器 */
.streaming-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-left: 0.5rem;
  vertical-align: middle;
}

.streaming-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background: var(--primary);
  animation: typing 1.4s infinite ease-in-out;
}

.streaming-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.streaming-dot:nth-child(2) {
  animation-delay: -0.16s;
}

.streaming-dot:nth-child(3) {
  animation-delay: 0s;
}

/* 流式消息气泡样式 */
.message-bubble-streaming {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.85));
  border: 1px solid rgba(79, 70, 229, 0.2);
  animation: pulse 2s infinite;
}

/* 消息输入区域 */
.chat-input-area {
  padding: 1.5rem 2rem;
  border-top: 1px solid #E5E7EB;
  background: white;
}

.input-container {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.message-input {
  flex: 1;
}

.send-button {
  flex-shrink: 0;
}

.input-tips {
  text-align: center;
}

.tip-text {
  font-size: 0.75rem;
  color: var(--neutral);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.tip-icon {
  color: var(--primary);
  font-size: 0.875rem;
}

/* 评估结果 */
.evaluation-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.evaluation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #F9FAFB;
  border-radius: 0.5rem;
}

.overall-score {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.score-circle {
  position: relative;
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  background: conic-gradient(var(--primary) 0deg, var(--primary) calc(var(--score) * 3.6deg), #E5E7EB calc(var(--score) * 3.6deg), #E5E7EB 360deg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.score-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--dark);
}

.score-max {
  font-size: 0.75rem;
  color: var(--neutral);
}

.score-label {
  font-size: 0.875rem;
  color: var(--neutral);
}

.score-grade {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  font-weight: 600;
  font-size: 0.875rem;
}

.score-grade-excellent {
  background: rgba(34, 197, 94, 0.1);
  color: var(--success);
}

.score-grade-good {
  background: rgba(16, 185, 129, 0.1);
  color: var(--secondary);
}

.score-grade-average {
  background: rgba(245, 158, 11, 0.1);
  color: var(--warning);
}

.score-grade-poor {
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
}

.evaluation-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.details-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--dark);
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.detail-item {
  padding: 1rem;
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
  background: #FAFAFA;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.detail-category {
  font-weight: 500;
  color: var(--dark);
}

.detail-score {
  font-weight: 600;
  color: var(--primary);
}

.detail-progress {
  margin-bottom: 0.75rem;
}

.detail-feedback {
  margin: 0;
  font-size: 0.875rem;
  color: var(--neutral);
  line-height: 1.4;
}

.evaluation-suggestions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.suggestions-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--dark);
}

.suggestions-subtitle {
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary);
}

.suggestions-list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.suggestion-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #F9FAFB;
  border-radius: 0.375rem;
}

.suggestion-icon {
  color: var(--secondary);
  font-size: 1rem;
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.suggestion-item span {
  font-size: 0.875rem;
  color: var(--dark);
  line-height: 1.4;
}

/* 训练历史功能已移除 */

/* 加载和错误状态 */
.page-loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}

.error-result {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 消息额外信息样式 */
.message-extra-info {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.emotion-analysis,
.ai-guidance {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--primary);
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.info-label::before {
  content: '•';
  color: var(--primary);
  font-weight: bold;
}

.info-content {
  font-size: 0.8125rem;
  color: var(--neutral);
  line-height: 1.4;
  background: rgba(79, 70, 229, 0.05);
  padding: 0.5rem;
  border-radius: 0.375rem;
  border-left: 3px solid var(--primary);
}

.emotion-analysis .info-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.emotion-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
}

.emotion-name {
  font-weight: 600;
  color: var(--primary);
  min-width: 3rem;
}

.emotion-confidence {
  font-size: 0.75rem;
  color: var(--neutral);
  background: rgba(79, 70, 229, 0.1);
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
}

.emotion-intensity {
  font-size: 0.75rem;
  color: var(--warning);
  font-weight: 500;
}

.guidance-content {
  background: rgba(16, 185, 129, 0.05);
  border-left-color: var(--secondary);
  white-space: pre-wrap;
  line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .simulation-container {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .scenario-grid {
    grid-template-columns: 1fr;
  }
  
  .session-info-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .session-info {
    flex-direction: column;
    gap: 1rem;
  }
  
  .session-stats {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .content-card-header {
    padding: 1.5rem;
  }
  
  .scenario-grid {
    padding: 1.5rem;
  }
  
  .scenario-card {
    padding: 1rem;
  }
  
  .chat-container {
    height: 500px;
  }
  
  .message-group {
    gap: 0.75rem;
  }
  
  .message-content {
    max-width: 85%;
  }
  
  .chat-input-area {
    padding: 1rem 1.5rem;
  }
  
  .input-container {
    flex-direction: column;
  }
  
  /* 训练历史功能已移除 */
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .message-extra-info {
    margin-top: 0.5rem;
    padding-top: 0.5rem;
  }
  
  .info-content {
    font-size: 0.75rem;
    padding: 0.375rem;
  }
}

@media (max-width: 480px) {
  .simulation-main-content {
    padding-top: 56px;
  }
  
  .scenario-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
  
  .chat-container {
    /* 原高度是固定值，改为基于视口的弹性高度 */
    /* 例如：占满父容器剩余高度，适配不同屏幕 */
    flex: 1; 
    display: flex;
    flex-direction: column;
    min-height: 400px; /* 保留最小高度，防止过小 */
  }
  
  .message-bubble {
    padding: 0.75rem 1rem;
  }
  
  .message-text {
    font-size: 0.8125rem;
  }
  
  .info-content {
    font-size: 0.75rem;
    padding: 0.25rem;
  }
}
</style>