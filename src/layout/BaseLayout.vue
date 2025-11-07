<template>
  <div class="base-layout">
  <!-- 页眉 -->
  <div class="header">
    <h1>CareSync AI 儿童端演示界面</h1>
  </div>
  <!-- 导航栏 -->
  <div class="nav-group">
    <div class="tabs">
      <!-- 登陆页面按钮 -->
      <button 
        @click="switchTab('login')"
        :class="{ active: currentTab === 'login' }"
      >
        登录页面
      </button>
      <!-- 聊天页面按钮 -->
      <button 
        @click="switchTab('chat')"
        :class="{ active: currentTab === 'chat' }"
      >
        聊天页面
      </button>
      <!-- 数字人对话页面按钮 -->
      <button 
        @click="switchTab('live')"
        :class="{ active: currentTab === 'live' }"
      >
        数字人对话
      </button>
    </div>
  </div>
  <!-- 主要内容-手机展示框 -->
  <div class="phone-frame">
    <!-- 手机顶部状态栏 -->
    <div class="phone-status-bar">
      <span class="dot red"></span>
      <span class="dot yellow"></span>
      <span class="dot green"></span>
      <span class="title">CareSync AI 儿童端</span>
    </div>
    <router-view :key="currentTab"/>
  </div>
  <!-- 页脚 -->
  <div class="footer">
      <p>CareSync AI 儿童情感陪伴与服务项目 © 2025</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
// 初始选中当前路由对应的标签，从路由路径中提取标签名
const currentTab = ref(route.path.split('/').pop() || 'login');

// 监听路由变化，自动更新 currentTab
watch(() => route.path, (newPath) => {
  const tabName = newPath.split('/').pop() || 'login';
  currentTab.value = tabName;
});

// 切换标签时跳转路由
const switchTab = (tabName: string) => {
  currentTab.value = tabName;
  router.push(`/${tabName}`);
};

</script>
<style scoped>
.base-layout {
  width: 100vw;
  height: 100%;
  min-height: 100vh;
  background-color: #0f172a;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
  color: #e2e8f0;
}

.header {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 3vw;
  background-color:#1F2937;
}

.header h1 {
  font-size: 1.5vw;
  font-weight: 600;
  margin: 0;
}

.nav-group {
  display: flex;
  justify-content: space-between;
  width: 90%;
  max-width: 1200px;
  margin-bottom: 50px;
  margin-top: 20px;
}

.tabs {
  display: flex;
  gap: 10px;
}


.tabs button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background-color: #1e293b;
  color: #cbd5e1;
  cursor: pointer;
  font-size: 14px;
}

.tabs button.active {
  background-color: #10b981;
  color: #fff;
}

.phone-frame {
  width: 320px;
  height: 600px;
  border: 8px solid #000;
  border-radius: 30px;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  margin-bottom: 30px;
  position: relative;
}

.phone-status-bar {
  height: 40px;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  padding: 0 15px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 5px;
}

.red { background-color: #ef4444; }
.yellow { background-color: #f59e0b; }
.green { background-color: #10b981; }

.title {
  margin-left: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.footer {
  margin-top: auto;
}

.footer p {
  font-size: 14px;
  color: #94a3b8;
  margin: 0;
}
</style>
