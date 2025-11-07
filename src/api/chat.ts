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

// 发送聊天消息接口 - 适配后端接口
export const sendChatMessage = (params: ChatMessageDTO) => {
  return http.post<ResultChildChatMessageVO>('/api/child/chat/send', params);
};

// 本地存储消息类型定义（用于前端存储）
export interface LocalMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type: 'text' | 'image' | 'voice' | 'video';
}

// 将本地消息转换为API消息格式
export const convertToApiMessages = (messages: LocalMessage[]): ChatMessage[] => {
  return messages.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'assistant',
    content: msg.content
  }));
};

// 从API响应创建本地消息
export const createLocalMessageFromResponse = (content: string, sender: 'user' | 'ai'): LocalMessage => {
  return {
    id: Date.now().toString(),
    content,
    sender,
    timestamp: new Date(),
    type: 'text'
  };
};