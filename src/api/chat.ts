import { http } from './http';

// 聊天消息类型定义
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// 聊天请求接口
export interface ChatRequest {
  prompt: string;
  history: ChatMessage[];
}

// 聊天消息DTO接口
export interface ChatMessageDTO {
  chatRequest: ChatRequest;
  contentType: string;
  sessionId: string;
  digiSessionId: string;
}

// 聊天响应接口
export interface ChildChatMessageVO {
  content: string;
  timestamp: string;
}

// 响应结果接口
export interface ResultChildChatMessageVO {
  code: number;
  msg: string;
  data: ChildChatMessageVO;
}

// 流式响应数据类型定义
export interface StreamResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      content: string;
    };
    finish_reason: string | null;
  }>;
}

// 发送聊天消息接口 - 适配后端接口
export const sendChatMessage = (params: ChatMessageDTO) => {
  return http.post<ResultChildChatMessageVO>('/api/child/chat/send/stream', params);
};

// 流式发送聊天消息接口
export const sendChatMessageStream = (params: ChatMessageDTO): Promise<ReadableStreamDefaultReader<Uint8Array>> => {
  return fetch('/api/child/chat/send/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `${localStorage.getItem('token') || ''}`
    },
    body: JSON.stringify(params)
  }).then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.body?.getReader();
  });
};

// 处理流式响应的函数
export const processStreamResponse = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onContent: (content: string) => void,
  onError?: (error: Error) => void
): Promise<void> => {
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let isDone = false;

  try {
    while (!isDone) {
      const { done, value } = await reader.read();
      
      if (done) {
        break;
      }

      const decodedValue = decoder.decode(value, { stream: true });
      buffer += decodedValue;

      // 分割SSE事件
      let events = buffer.split(/\n\n/);
      
      // 保留最后一个可能不完整的事件
      buffer = events.pop() || '';

      // 处理每个完整的事件
      for (const event of events) {
        if (event.trim()) {
          // 解析SSE事件
          const lines = event.split(/\n/);
          let jsonData = '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('data:')) {
              // 提取data字段内容
              let dataContent = trimmedLine.substring(5).trim();
              
              // 移除可能的重复data:前缀
              while (dataContent.startsWith('data:')) {
                dataContent = dataContent.substring(5).trim();
              }
              
              if (dataContent) {
                jsonData += dataContent;
              }
            }
          }

          // 检查是否是结束信号
          if (jsonData === '[DONE]') {
            isDone = true;
            break;
          }

          // 只有非空的jsonData才尝试解析
          if (jsonData) {
            try {
              const parsed: StreamResponse = JSON.parse(jsonData);
              
              // 提取content字段
              const content = parsed.choices?.[0]?.delta?.content;
              
              if (content) {
                onContent(content);
              }
            } catch (e) {
              console.error('JSON解析错误:', e);
              console.error('错误数据:', jsonData);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('流式响应处理错误:', error);
    if (onError && error instanceof Error) {
      onError(error);
    }
  } finally {
    reader.releaseLock();
  }
};

// 本地存储消息类型定义（用于前端存储）
export interface LocalMessage {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  type: 'text' | 'image' | 'voice' | 'video';
}

// 将本地消息转换为API消息格式
export const convertToApiMessages = (messages: LocalMessage[]): ChatMessage[] => {
  return messages.map(msg => ({
    role: msg.sender,
    content: msg.content
  }));
};

// 从API响应创建本地消息
export const createLocalMessageFromResponse = (content: string, sender: 'user' | 'assistant'): LocalMessage => {
  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    content,
    sender,
    timestamp: new Date(),
    type: 'text'
  };
};