<template>
  <div class="book-search-view">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>书籍检索</h2>
    </div>
    
    <!-- 主要内容 -->
    <div class="main-content">
      <!-- 搜索表单 -->
      <div class="search-form">
        <!-- 搜索框 -->
        <div class="form-group">
          <label for="queryString">搜索内容</label>
          <input 
            type="text" 
            id="queryString" 
            v-model="form.queryString" 
            placeholder="请输入搜索内容"
            class="input-field"
          />
        </div>
        
        <!-- 分类选择 -->
        <div class="form-group">
          <label for="category">书籍分类</label>
          <select 
            id="category" 
            v-model="form.category" 
            class="select-field"
          >
            <option value="">全部分类</option>
            <option value="教育">教育</option>
            <option value="游戏互动">游戏互动</option>
            <option value="艺术">艺术</option>
          </select>
        </div>
        
        <!-- 排序选择 -->
        <div class="form-group">
          <label for="order">排序方式</label>
          <select 
            id="order" 
            v-model="form.order" 
            class="select-field"
          >
            <option value="">默认排序</option>
            <option value="title">按标题排序</option>
            <option value="author">按作者排序</option>
            <option value="category">按分类排序</option>
          </select>
        </div>
        
        <!-- 搜索按钮 -->
        <button @click="handleSearch" class="primary-button">搜索</button>
      </div>
      
      <!-- 搜索结果 -->
      <div v-if="books.length > 0" class="search-results">
        <div class="results-header">
          <h3>搜索结果 ({{ totalRecords }})</h3>
          <div v-if="isLoading" class="loading-indicator">加载中...</div>
        </div>
        
        <div class="books-list">
          <div 
            v-for="book in books" 
            :key="book.id" 
            class="book-item"
          >
            <img :src="book.imageUrl.trim()" :alt="book.title" class="book-image" />
            <div class="book-info">
              <h5>{{ book.title }}</h5>
              <p class="author">{{ book.author }}</p>
              <p class="category">{{ book.category }}</p>
              <p class="description">{{ book.description }}</p>
              <div class="book-tags">
                <span v-for="tag in book.tags.split(',')" :key="tag" class="tag">{{ tag }}</span>
              </div>
              <button 
                @click="toggleFavorite(book)" 
                class="favorite-button"
                :class="{ active: book.isFavorite }"
              >
                {{ book.isFavorite ? '取消收藏' : '收藏' }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- 分页控件 -->
        <div v-if="totalPages > 1" class="pagination">
          <button 
            @click="handlePageChange(currentPage - 1)" 
            :disabled="currentPage <= 1 || isLoading"
            class="pagination-button"
          >
            上一页
          </button>
          
          <div class="pagination-info">
            第 {{ currentPage }} 页，共 {{ totalPages }} 页
          </div>
          
          <button 
            @click="handlePageChange(currentPage + 1)" 
            :disabled="currentPage >= totalPages || isLoading"
            class="pagination-button"
          >
            下一页
          </button>
        </div>
      </div>
      
      <!-- 无结果提示 -->
      <div v-else-if="isSearched" class="no-results">
        <h3>暂无搜索结果</h3>
        <p>请尝试调整搜索条件</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { searchBooks, getBookListPage, getBookBatch, addBookFavorite, removeBookFavorite, BookQuetyDTO, BookQuetyPageDTO, BookVO, BookFavoriteDTO } from '../api/book';

// 表单数据
const form = ref<BookQuetyDTO>({
  queryString: '',
  category: '',
  order: ''
});

// 搜索结果
const books = ref<BookVO[]>([]);
const isSearched = ref(false);

// 分页相关数据
const currentPage = ref(1);
const pageSize = ref(10);
const totalRecords = ref(0);
const totalPages = ref(0);
const isLoading = ref(false);

// 搜索书籍
const handleSearch = async () => {
  try {
    isLoading.value = true;
    currentPage.value = 1; // 重置到第一页
    
    // 构建分页查询参数
    const pageParams: BookQuetyPageDTO = {
      queryString: form.value.queryString,
      category: form.value.category,
      order: form.value.order,
      pageSize: pageSize.value,
      pageNum: currentPage.value,
      useCategoryPartition: true
    };
    
    // 第一步：分页查询书籍ID列表
    const idResponse = await getBookListPage(pageParams);
    console.log('ID列表查询结果:', idResponse);
    
    if (idResponse.code === 1 || idResponse.code === 200) {
      const idList = idResponse.data.records;
      totalRecords.value = idResponse.data.total;
      totalPages.value = Math.ceil(totalRecords.value / pageSize.value);
      
      if (idList.length > 0) {
        // 第二步：根据ID列表批量获取书籍详情
        const booksResponse = await getBookBatch(idList);
        console.log('书籍详情查询结果:', booksResponse);
        
        if (booksResponse.code === 1 || booksResponse.code === 200) {
          books.value = booksResponse.data;
          isSearched.value = true;
        } else {
          alert(booksResponse.msg || '获取书籍详情失败');
          books.value = [];
        }
      } else {
        // 没有找到匹配的书籍
        books.value = [];
        isSearched.value = true;
      }
    } else {
      alert(idResponse.msg || '搜索失败');
      books.value = [];
      isSearched.value = false;
    }
  } catch (error) {
    console.error('搜索请求失败:', error);
    alert('搜索请求失败，请稍后重试');
    books.value = [];
    isSearched.value = false;
  } finally {
    isLoading.value = false;
  }
};

// 分页查询书籍
const handlePageChange = async (page: number) => {
  try {
    isLoading.value = true;
    currentPage.value = page;
    
    // 构建分页查询参数
    const pageParams: BookQuetyPageDTO = {
      queryString: form.value.queryString,
      category: form.value.category,
      order: form.value.order,
      pageSize: pageSize.value,
      pageNum: currentPage.value,
      useCategoryPartition: true
    };
    
    // 第一步：分页查询书籍ID列表
    const idResponse = await getBookListPage(pageParams);
    
    if (idResponse.code === 1 || idResponse.code === 200) {
      const idList = idResponse.data.records;
      
      if (idList.length > 0) {
        // 第二步：根据ID列表批量获取书籍详情
        const booksResponse = await getBookBatch(idList);
        
        if (booksResponse.code === 1 || booksResponse.code === 200) {
          books.value = booksResponse.data;
        } else {
          alert(booksResponse.msg || '获取书籍详情失败');
          books.value = [];
        }
      } else {
        books.value = [];
      }
    } else {
      alert(idResponse.msg || '搜索失败');
      books.value = [];
    }
  } catch (error) {
    console.error('分页查询失败:', error);
    alert('分页查询失败，请稍后重试');
    books.value = [];
  } finally {
    isLoading.value = false;
  }
};

// 切换收藏状态
const toggleFavorite = async (book: BookVO) => {
  try {
    const params: BookFavoriteDTO = { bookId: book.id };
    
    if (book.isFavorite) {
      // 取消收藏
      await removeBookFavorite(params);
      book.isFavorite = false;
      alert('取消收藏成功');
    } else {
      // 添加收藏
      await addBookFavorite(params);
      book.isFavorite = true;
      alert('收藏成功');
    }
  } catch (error) {
    console.error('收藏操作失败:', error);
    alert('收藏操作失败，请稍后重试');
  }
};
</script>

<style scoped>
.book-search-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
  padding: 20px;
  box-sizing: border-box;
  color: #1e293b;
}

.page-header {
  text-align: center;
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #0f172a;
}

.main-content {
  flex: 1;
  overflow-y: auto;
}

.search-form {
  background-color: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 25px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: #334155;
}

.input-field,
.select-field {
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  color: #1e293b;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

.input-field:focus,
.select-field:focus {
  outline: none;
  border-color: #3b82f6;
}

.primary-button {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  background-color: #10b981;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.primary-button:hover {
  background-color: #059669;
}

.search-results {
  background-color: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
}

.search-results h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #0f172a;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.loading-indicator {
  color: #3b82f6;
  font-size: 14px;
  font-weight: 500;
}

.books-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.book-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.book-image {
  width: 80px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
}

.book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.book-info h5 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 5px 0;
  color: #1e293b;
}

.book-info .author {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 5px 0;
}

.book-info .category {
  font-size: 12px;
  color: #94a3b8;
  margin: 0 0 10px 0;
}

.book-info .description {
  font-size: 12px;
  line-height: 1.4;
  color: #475569;
  margin: 0 0 10px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.book-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 10px;
}

.tag {
  padding: 4px 8px;
  background-color: #e0f2fe;
  color: #0369a1;
  font-size: 10px;
  border-radius: 12px;
}

.favorite-button {
  align-self: flex-start;
  padding: 6px 12px;
  border: 2px solid #f59e0b;
  border-radius: 6px;
  background-color: #fff;
  color: #f59e0b;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.favorite-button:hover {
  background-color: #f59e0b;
  color: #fff;
}

.favorite-button.active {
  background-color: #f59e0b;
  color: #fff;
}

.no-results {
  background-color: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
}

.no-results h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 10px;
  color: #0f172a;
}

.no-results p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-top: 30px;
  padding: 20px;
  border-top: 1px solid #e2e8f0;
}

.pagination-button {
  padding: 8px 16px;
  border: 2px solid #3b82f6;
  border-radius: 6px;
  background-color: #fff;
  color: #3b82f6;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-button:hover:not(:disabled) {
  background-color: #3b82f6;
  color: #fff;
}

.pagination-button:disabled {
  border-color: #cbd5e1;
  color: #cbd5e1;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #64748b;
  font-weight: 500;
}
</style>
