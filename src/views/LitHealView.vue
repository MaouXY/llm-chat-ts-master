<template>
  <div class="lit-heal-view">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>文学疗愈</h2>
    </div>
    
    <!-- 主要内容 -->
    <div class="main-content">
      <!-- 情绪选择 -->
      <div class="section">
        <h3>选择你的情绪</h3>
        <div class="mood-buttons">
          <button 
            v-for="mood in moods" 
            :key="mood" 
            @click="selectMood(mood)"
            :class="{ active: selectedMood === mood }"
          >
            {{ mood }}
          </button>
        </div>
      </div>
      
      <!-- 写作标题输入 -->
      <div class="section">
        <h3>写作标题</h3>
        <input 
          type="text" 
          v-model="form.theme" 
          placeholder="请输入写作标题"
          class="input-field"
        />
      </div>
      
      <!-- 写作内容输入 -->
      <div class="section">
        <h3>写作内容</h3>
        <textarea 
          v-model="form.writing" 
          placeholder="请输入你的写作内容"
          class="textarea-field"
          rows="6"
        ></textarea>
      </div>
      
      <!-- 操作按钮 -->
      <div class="button-group">
        <button @click="startHeal" class="primary-button">开始疗愈</button>
        <button @click="clearForm" class="secondary-button">清空</button>
      </div>
      
      <!-- 结果展示 -->
      <div v-if="result" class="result-section">
        <h3>疗愈结果</h3>
        
        <!-- 分析结果 -->
        <div class="analysis">
          <h4>AI分析内容</h4>
          <div class="analysis-content" v-html="result.analysis.replace(/\n/g, '<br>')"></div>
        </div>
        
        <!-- 书籍推荐 -->
        <div class="book-recommend">
          <h4>书籍推荐</h4>
          <div class="books-list">
            <div 
              v-for="book in result.bookRecommend" 
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
        </div>
        
        <!-- AI生成图像 -->
        <div class="visualization" v-if="result.visualizationUrl">
          <h4>AI生成图像</h4>
          <img :src="result.visualizationUrl.trim()" alt="AI生成图像" class="visualization-image" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { litHeal, LitHealDTO, LitHealVO } from '../api/litHeal';
import { addBookFavorite, removeBookFavorite, BookFavoriteDTO } from '../api/book';

// 情绪选项
const moods = [
  '快乐', '悲伤', '兴奋', '平静', 
  '焦虑', '愤怒', '灵感', '怀旧'
];

// 表单数据
const selectedMood = ref('');
const form = ref<LitHealDTO>({
  mood: '',
  theme: '',
  writing: ''
});

// 结果数据
const result = ref<LitHealVO | null>(null);

// 选择情绪
const selectMood = (mood: string) => {
  selectedMood.value = mood;
  form.value.mood = mood;
};

// 开始疗愈
const startHeal = async () => {
  // 简单验证
  if (!form.value.mood) {
    alert('请选择情绪');
    return;
  }
  if (!form.value.theme) {
    alert('请输入写作标题');
    return;
  }
  if (!form.value.writing) {
    alert('请输入写作内容');
    return;
  }
  
  try {
    const response = await litHeal(form.value);
    console.log('疗愈结果:', response);
    if (response.code === 200 || response.code === 0) {
      result.value = response.data;
    } else {
      alert(response.msg || '疗愈失败');
    }
  } catch (error) {
    console.error('疗愈请求失败:', error);
    alert('疗愈请求失败，请稍后重试');
  }
};

// 清空表单
const clearForm = () => {
  selectedMood.value = '';
  form.value = {
    mood: '',
    theme: '',
    writing: ''
  };
  result.value = null;
};

// 切换收藏状态
const toggleFavorite = async (book: any) => {
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
.lit-heal-view {
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

.section {
  margin-bottom: 25px;
}

.section h3 {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 12px;
  color: #334155;
}

.mood-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.mood-buttons button {
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background-color: #fff;
  color: #475569;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mood-buttons button:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.mood-buttons button.active {
  background-color: #3b82f6;
  color: #fff;
  border-color: #3b82f6;
}

.input-field {
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  color: #1e293b;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

.input-field:focus {
  outline: none;
  border-color: #3b82f6;
}

.textarea-field {
  width: 100%;
  padding: 12px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  color: #1e293b;
  resize: vertical;
  box-sizing: border-box;
  transition: border-color 0.3s ease;
  font-family: inherit;
}

.textarea-field:focus {
  outline: none;
  border-color: #3b82f6;
}

.button-group {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
}

.primary-button {
  flex: 1;
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

.secondary-button {
  flex: 1;
  padding: 14px;
  border: 2px solid #64748b;
  border-radius: 8px;
  background-color: #fff;
  color: #64748b;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.secondary-button:hover {
  background-color: #64748b;
  color: #fff;
}

.result-section {
  background-color: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
}

.result-section h3 {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #0f172a;
}

.analysis {
  margin-bottom: 25px;
}

.analysis h4 {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
  color: #334155;
}

.analysis-content {
  font-size: 14px;
  line-height: 1.6;
  color: #475569;
  margin: 0;
}

.analysis-content h4 {
  font-size: 16px;
  font-weight: 600;
  margin: 15px 0 10px 0;
  color: #1e293b;
}

.analysis-content strong {
  font-weight: 600;
  color: #1e293b;
}

.book-recommend {
  margin-bottom: 25px;
}

.book-recommend h4 {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 15px;
  color: #334155;
}

.books-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
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

.book-info .category {
  font-size: 12px;
  color: #94a3b8;
  margin: 0 0 10px 0;
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

.visualization {
  margin-bottom: 25px;
}

.visualization h4 {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 15px;
  color: #334155;
}

.visualization-image {
  width: 100%;
  height: auto;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
</style>
