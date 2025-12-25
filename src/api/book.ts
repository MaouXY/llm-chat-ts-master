import { http } from './http';

// 书籍搜索请求DTO接口
export interface BookQuetyDTO {
  queryString: string;
  category: string;
  order: string;
}

// 书籍分页查询DTO接口
export interface BookQuetyPageDTO {
  queryString: string;
  category: string;
  order: string;
  pageSize: number;
  pageNum: number;
  useCategoryPartition: boolean;
}

// 书籍信息VO接口
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

// 分页结果接口
export interface PageResultLong {
  total: number;
  records: number[];
}

// 分页查询响应结果接口
export interface ResultPageResultLong {
  code: number;
  msg: string;
  data: PageResultLong;
}

// 响应结果接口
export interface ResultListBookVO {
  code: number;
  msg: string;
  data: BookVO[];
}

// 搜索书籍接口调用函数（原有功能）
export const searchBooks = (params: BookQuetyDTO) => {
  return http.post<ResultListBookVO>('/wen/book/search', params);
};

// 分页查询书籍ID列表接口调用函数
export const getBookListPage = (params: BookQuetyPageDTO) => {
  return http.post<ResultPageResultLong>('/wen/book/search/page', params);
};

// 批量获取书籍详情接口调用函数
export const getBookBatch = (ids: number[]) => {
  return http.post<ResultListBookVO>('/wen/book/batch', ids);
};

// 收藏书籍请求DTO接口
export interface BookFavoriteDTO {
  bookId: number;
}

// 通用响应结果接口
export interface Result {
  code: number;
  msg: string;
  data: object;
}

// 收藏书籍接口调用函数
export const addBookFavorite = (params: BookFavoriteDTO) => {
  return http.post<Result>('/wen/book-favorite/add', params);
};

// 取消收藏书籍接口调用函数
export const removeBookFavorite = (params: BookFavoriteDTO) => {
  return http.post<Result>('/wen/book-favorite/remove', params);
};
