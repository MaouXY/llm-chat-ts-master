// AI模拟训练对话服务
import { http, aiHttp } from '@/services/api';
import type {
  ApiResponse,
  SimulationScenario,
  TrainingSession,
  TrainingMessageRequest,
  TrainingChatResponse,
  TrainingEvaluation,
  ChatMessage
} from './types';

export class SimulationService {
  private baseUrl = '/api/social-worker/simulation';

  // 获取训练场景列表
  async getScenarios(): Promise<SimulationScenario[]> {
    try {
      const result = await http.get(`${this.baseUrl}/scenarios`);
      
      if (result.code === 1) {
        return result.data;
      } else {
        throw new Error(result.msg || '获取场景列表失败');
      }
    } catch (error) {
      console.error('获取训练场景失败:', error);
      // 返回模拟数据
      return this.getMockScenarios();
    }
  }

  // 开始新的训练会话
  async startTrainingSession(scenarioId: number): Promise<TrainingSession> {
    try {
      const result = await http.post(`${this.baseUrl}/start`, { scenarioId });
      
      if (result.code === 1) {
        return result.data;
      } else {
        throw new Error(result.msg || '开始训练失败');
      }
    } catch (error) {
      console.error('开始训练会话失败:', error);
      // 返回模拟数据
      return this.getMockTrainingSession(scenarioId);
    }
  }

  // 发送训练消息（普通接口）
  async sendTrainingMessage(request: TrainingMessageRequest): Promise<TrainingChatResponse> {
    try {
      // 转换chatHistory为后端期望的history格式
      const history = request.chatHistory.map(msg => ({
        role: msg.senderType === 'user' ? 'user' : 'ai',
        content: msg.content
      }));
      
      // 使用AI专用HTTP实例，设置更长的超时时间
      const result = await aiHttp.post(`${this.baseUrl}/send`, {
        sessionId: request.sessionId,
        prompt: request.prompt,
        history: history
      });
      
      if (result.code === 1) {
        return result.data;
      } else {
        throw new Error(result.msg || '发送消息失败');
      }
    } catch (error) {
      console.error('发送训练消息失败:', error);
      // 返回模拟数据
      return this.getMockChatResponse(request.sessionId, request.prompt);
    }
  }

  // 发送训练消息（流式接口）
  async sendTrainingMessageStream(request: TrainingMessageRequest, onChunk: (chunk: any) => void, onComplete: () => void) {
    try {
      // 转换chatHistory为后端期望的history格式
      const history = request.chatHistory.map(msg => ({
        role: msg.senderType === 'user' ? 'user' : 'ai',
        content: msg.content
      }));
      
      // 使用fetch API处理流式响应，手动添加认证头
      const token = localStorage.getItem('token');
      const response = await fetch(`${this.baseUrl}/send/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': token } : {})
        },
        body: JSON.stringify({
          sessionId: request.sessionId,
          prompt: request.prompt,
          history: history
        }),
      });
      
      // 添加调试信息
      console.log('流式响应状态:', response.status);
      console.log('流式响应头:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // 处理流式响应
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }
      
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          console.log('流式响应结束，剩余buffer:', buffer);
          break;
        }
        
        // 解码二进制数据
        const decodedChunk = decoder.decode(value, { stream: true });
        console.log('解码后的chunk:', JSON.stringify(decodedChunk));
        buffer += decodedChunk;
        
        // 按行处理数据
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          
          // 跳过空行
          if (line.trim() === '') continue;
          
          // 处理SSE事件格式：data: {"id": "chatcmpl-", "object": "chat.completion.chunk", ...}
          if (line.startsWith('data: ')) {
            // 提取data部分，处理可能的重复data:前缀
            let data = line.slice(6).trim();
            
            // 检查是否是结束标志
            if (data === '[DONE]') {
              onComplete();
              continue;
            }
            
            // 只有当data非空时才尝试解析
            if (data) {
              try {
                // 解析JSON数据
                const parsedData = JSON.parse(data);
                // console.log('解析后的JSON数据:', parsedData);
                // 调用回调函数，传递解析后的数据
                onChunk(parsedData);
              } catch (jsonError) {
                console.error('解析JSON数据失败:', jsonError, '原始数据:', JSON.stringify(data));
              }
            } else {
              // data为空，可能是不完整的SSE事件，跳过
              // console.log('收到空data行，跳过');
            }
          } else if (line === 'data:') {
            // 只包含"data:"的行，是不完整的SSE事件，跳过
            // console.log('收到不完整的SSE事件行，跳过');
          } else if (line.startsWith('data:')) {
            // 处理带有重复"data:"前缀的行，如"data:data: {json}"
            let data = line;
            // 移除所有重复的"data:"前缀
            while (data.startsWith('data:')) {
              data = data.slice(5).trim();
            }
            
            // 检查是否是结束标志
            if (data === '[DONE]') {
              onComplete();
              continue;
            }
            
            // 只有当data非空时才尝试解析
            if (data) {
              try {
                // 解析JSON数据
                const parsedData = JSON.parse(data);
                // console.log('解析重复前缀后的JSON数据:', parsedData);
                // 调用回调函数，传递解析后的数据
                onChunk(parsedData);
              } catch (jsonError) {
                console.log('解析重复前缀后的JSON失败:', jsonError, '原始数据:', JSON.stringify(line));
              }
            }
          } else {
            // 非SSE格式行，跳过处理，避免不必要的错误
          }
        }
      }
    } catch (error) {
      console.log('发送训练消息（流式）失败:', error);
      // 处理错误情况
      onComplete();
      // 可以选择回退到普通接口
      const response = await this.sendTrainingMessage(request);
      onChunk({
        choices: [{
          delta: {
            content: `---儿童回复---\n${response.childReply}\n---情感分析---\n${response.emotionAnalysis}\n---指导意见---\n${response.aiGuidance}`
          }
        }]
      });
      onComplete();
    }
  }

  // 结束训练会话
  async endTrainingSession(sessionId: number): Promise<TrainingEvaluation> {
    try {
      const result = await http.post(`${this.baseUrl}/end/${sessionId}`, { sessionId }, {
        timeout: 300000 // 30秒超时
      });
      
      if (result.code === 1) {
        return result.data;
      } else {
        throw new Error(result.msg || '结束训练失败');
      }
    } catch (error) {
      console.error('结束训练会话失败:', error);
      // 返回模拟数据
      return this.getMockTrainingEvaluation(sessionId);
    }
  }

  // 获取模拟场景数据
  private getMockScenarios(): SimulationScenario[] {
    return [
      {
        id: 1,
        title: '孤独的留守儿童',
        type: '情感表达',
        description: '模拟一个性格内向、缺乏陪伴的留守儿童，需要建立信任关系。',
        difficulty: 'BASIC' as const,
        estimatedDuration: 15,
        metadata: {
          age: '8-12岁',
          personality: '内向、缺乏自信',
          situation: '父母长期在外打工'
        }
      },
      {
        id: 2,
        title: '学习困难的儿童',
        type: '自主学习',
        description: '模拟一个学习成绩下滑、对学习失去信心的儿童，需要学习支持。',
        difficulty: 'INTERMEDIATE' as const,
        estimatedDuration: 20,
        metadata: {
          age: '10-14岁',
          personality: '沮丧、缺乏动力',
          situation: '学习成绩持续下滑'
        }
      },
      {
        id: 3,
        title: '情绪波动的儿童',
        type: '情绪管理',
        description: '模拟一个情绪不稳定、有行为问题的儿童，需要情绪管理指导。',
        difficulty: 'ADVANCED' as const,
        estimatedDuration: 25,
        metadata: {
          age: '12-16岁',
          personality: '情绪化、冲动',
          situation: '行为问题突出'
        }
      }
    ];
  }

  // 获取模拟训练会话数据
  private getMockTrainingSession(scenarioId: number): TrainingSession {
    return {
      id: Date.now(),
      workerId: 1, // 当前社工ID
      scenarioId,
      sessionStatus: 'IN_PROGRESS',
      startTime: new Date().toISOString(),
      totalRounds: 0,
      createTime: new Date().toISOString(),
      updateTime: new Date().toISOString()
    };
  }

  // 获取模拟聊天响应数据
  private getMockChatResponse(sessionId: number, prompt: string): TrainingChatResponse {
    const responses = [
      '……嗯。姐姐，你的手好暖呀。',
      '我今天过得一般...同学们都有爸爸妈妈来接放学，只有我是自己回家的。我很想爸爸妈妈...',
      '真的吗？但是我总是做不好，老师总说我不用功...',
      '我不想说话，我觉得很累...',
      '谢谢姐姐陪我聊天，我感觉好一些了。',
      '我...我不知道该说什么，就是觉得很难过...'
    ];

    const emotionAnalyses = [
      '{"detected_emotions": [{"emotion": "开心", "confidence": 85}], "emotion_intensity": 60}',
      '{"detected_emotions": [{"emotion": "悲伤", "confidence": 80}, {"emotion": "思念", "confidence": 75}], "emotion_intensity": 85}',
      '{"detected_emotions": [{"emotion": "沮丧", "confidence": 70}, {"emotion": "不安", "confidence": 65}], "emotion_intensity": 75}',
      '{"detected_emotions": [{"emotion": "疲惫", "confidence": 60}, {"emotion": "沮丧", "confidence": 55}], "emotion_intensity": 70}',
      '{"detected_emotions": [{"emotion": "感谢", "confidence": 80}, {"emotion": "平静", "confidence": 70}], "emotion_intensity": 50}',
      '{"detected_emotions": [{"emotion": "悲伤", "confidence": 90}, {"emotion": "困惑", "confidence": 60}], "emotion_intensity": 85}'
    ];

    const guidances = [
      '社工可回应："姐姐的手暖，你的小脑袋也软软的呢～"（用具体细节强化温暖感受），同时保持轻柔抚摸动作，接着轻声问："刚才是不是心里也暖暖的呀？"（引导孩子表达内在感受，巩固安全感与情感连接）。',
      '建议表达理解和共情："小明一定很想爸爸妈妈吧，这种感觉很正常。"接着问："在学校有没有什么有趣的事情想和姐姐分享呢？"（认可情绪，引导积极思维）。',
      '共情回应："学习确实不容易，姐姐理解你的感受。"然后说："每个人都有自己的节奏，重要的是不放弃。我们一起想想，有什么办法能让学习变得有趣一些吗？"（认可困难，鼓励坚持）。',
      '给予陪伴和安全感："没关系，不想说话的时候就静静坐着，姐姐陪着你。"保持静默陪伴，轻声问："需要姐姐做什么吗？或者我们就这样静静地待一会儿。"（尊重感受，提供安全空间）。',
      '强化积极体验："看到你感觉好一些，姐姐也很开心。这就是我们聊天的力量呢。"接着问："这种感觉能保持多久呢？我们下次再聊好不好？"（巩固效果，建立期待）。',
      '深度共情："心里的难过就像小怪兽一样，让你觉得喘不过气对吗？"轻柔地问："愿意告诉姐姐这个小怪兽是什么时候来的吗？"（用比喻帮助表达，温和引导）。'
    ];

    const randomIndex = Math.floor(Math.random() * responses.length);

    return {
      sessionId,
      childReply: responses[randomIndex],
      emotionAnalysis: emotionAnalyses[randomIndex],
      aiGuidance: guidances[randomIndex],
      timestamp: new Date().toISOString()
    };
  }

  // 获取模拟训练评估数据
  private getMockTrainingEvaluation(sessionId: number): any {
    const overallScore = 85;
    return {
      id: Date.now(),
      sessionId,
      overallScore,
      empathyScore: 85,
      communicationScore: 90,
      problemSolvingScore: 65,
      emotionalRecognitionScore: 90,
      strengths: '优点：能记住过往互动细节（画画、小兔子）建立连接，通过肢体安抚传递温暖。',
      areasForImprovement: '面对服务对象不安表现（低头抠衣角），缺乏对情绪的语言确认与回应。',
      aiComprehensiveComment: '您在本次训练中表现优秀，能够很好地识别儿童的情感需求并给予共情回应。',
      createTime: new Date().toISOString(),
      // 模板需要的新字段
      details: [
        {
          category: '共情能力',
          score: 85,
          feedback: '能够很好地理解和回应服务对象的情感需求'
        },
        {
          category: '沟通技巧',
          score: 90,
          feedback: '沟通方式温和，善于建立信任关系'
        },
        {
          category: '问题解决能力',
          score: 65,
          feedback: '遇到复杂情况时需要提升应对策略'
        },
        {
          category: '情感识别能力',
          score: 90,
          feedback: '能够准确识别服务对象的情感状态'
        }
      ],
      suggestions: [
        '增加情绪关注语言，如"看起来有点紧张，愿意说说吗？"',
        '尝试使用更多开放性问题引导儿童表达内心想法',
        '在未来的对话中注意给予具体的积极反馈',
        '加强对复杂情况的应对策略培训'
      ]
    };
  }

  // 创建自定义场景
  async createScenario(scenarioData: {
    title: string;
    description: string;
    difficulty: string;
    estimatedDuration: number;
  }): Promise<SimulationScenario> {
    try {
      const result = await http.post(`${this.baseUrl}/scenarios`, scenarioData);
      
      if (result.code === 1) {
        return result.data;
      } else {
        throw new Error(result.msg || '创建场景失败');
      }
    } catch (error) {
      console.error('创建自定义场景失败:', error);
      // 返回模拟数据
      return {
        id: Date.now(),
        title: scenarioData.title,
        type: '自定义',
        description: scenarioData.description,
        difficulty: (scenarioData.difficulty === '初级' ? 'BASIC' : scenarioData.difficulty === '中级' ? 'INTERMEDIATE' : 'ADVANCED') as 'BASIC' | 'INTERMEDIATE' | 'ADVANCED',
        estimatedDuration: scenarioData.estimatedDuration
      };
    }
  }

  /* 训练历史功能已移除 */

  // 将难度字符串转换为数字
  private getDifficultyLevelFromString(difficulty: string): number {
    const difficultyMap: Record<string, number> = {
      '初级': 1,
      '中级': 2,
      '高级': 3
    };
    return difficultyMap[difficulty] || 1;
  }

  /* 训练历史功能已移除 */
}

// 导出单例
export const simulationService = new SimulationService();