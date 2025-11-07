import { http } from './http';

// 聊天消息类型定义
export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: number;
  type: 'text' | 'image' | 'voice' | 'video';
}

// 发送消息接口
export const sendMessage = (params: {
  content: string;
  conversationId?: string;
  type?: 'text' | 'image' | 'voice' | 'video';
}) => {
  return http.post<Message>('/chat/send', params);
};

// 获取聊天记录接口
export const getChatHistory = (params: {
  conversationId?: string;
  page?: number;
  pageSize?: number;
}) => {
  return http.get<{
    messages: Message[];
    total: number;
    page: number;
    pageSize: number;
  }>('/chat/history', { params });
};

// 创建新会话接口
export const createConversation = (params: {
  title?: string;
  initialMessage?: string;
}) => {
  return http.post<{
    conversationId: string;
    title: string;
  }>('/chat/conversation', params);
};

// 获取会话列表接口
export const getConversations = () => {
  return http.get<{
    id: string;
    title: string;
    lastMessage: string;
    lastMessageTime: number;
    messageCount: number;
  }[]>('/chat/conversations');
};

// 删除会话接口
export const deleteConversation = (conversationId: string) => {
  return http.delete(`/chat/conversation/${conversationId}`);
};

// 更新会话标题接口
export const updateConversationTitle = (params: {
  conversationId: string;
  title: string;
}) => {
  return http.put('/chat/conversation/title', params);
};

// 上传文件接口
export const uploadFile = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  return http.post<{
    fileUrl: string;
    fileName: string;
    fileSize: number;
  }>('/chat/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};