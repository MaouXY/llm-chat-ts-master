import { http } from './http';

// 文学疗愈请求DTO接口
export interface LitHealDTO {
  mood: string;
  theme: string;
  writing: string;
}

// 书籍推荐VO接口
export interface BookVO {
  id: number;
  title: string;
  author: string;
  imageUrl: string;
  description: string;
  category: string;
  tags: string;
  isFavorite: boolean;
}

// 文学疗愈VO接口
export interface LitHealVO {
  analysis: string;
  bookRecommend: BookVO[];
  visualizationUrl: string;
}

// 响应结果接口
export interface ResultLitHealVO {
  code: number;
  msg: string;
  data: LitHealVO;
}

// 文学疗愈接口调用函数
export const litHeal = (params: LitHealDTO) => {
  return http.post<ResultLitHealVO>('/wen/lit-heal/heal', params);
};
