<template>
    <div class="login-page">
    <div class="avatar-placeholder"></div>
    <h2>欢迎来到</h2>
    <h3>CareSync AI</h3>
    <p>快乐成长的小伙伴</p>

    <div class="form-group">
      <label>儿童ID</label>
      <input 
        v-model="childNo" 
        type="text" 
        placeholder="请输入儿童ID" 
        maxlength="20"
      />
    </div>
    <div class="form-group">
      <label>密码</label>
      <div class="code-group">
        <input 
          v-model="verifyCode" 
          type="password" 
          placeholder="请输入密码" 
          maxlength="20"
        />
      </div>
    </div>
    <button 
      class="login-btn" 
      @click="handleLogin" 
      :disabled="isLoggingIn"
    >
      {{ isLoggingIn ? '登录中...' : '登录' }}
    </button>
    <p class="tip">忘记儿童ID？请联系您的社工老师</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { childLogin } from '../api/auth';
import { useAuthStore } from '../store/auth';

const router = useRouter();
const authStore = useAuthStore();

// 响应式数据
const childNo = ref('');
const verifyCode = ref('');
const isLoggingIn = ref(false);

// 处理登录
const handleLogin = async () => {
  if (!childNo.value) {
    alert('请输入儿童ID');
    return;
  }
  
  if (!verifyCode.value || verifyCode.value.length !== 4) {
    alert('请输入4位验证码');
    return;
  }
  
  isLoggingIn.value = true;
  
  try {
    const response = await childLogin({
      childNo: childNo.value,
      verifyCode: verifyCode.value
    });
    
    if (response.code === 1) {
      // 登录成功
      const { data } = response;
      
      // 存储token到localStorage和Pinia
      authStore.loginSuccess({
        id: data.id,
        name: data.name,
        role: data.role
      }, data.token);
      
      alert(`欢迎回来，${data.name}！`);
      
      // 跳转到聊天页面
      router.push('/chat');
    } else {
      // 处理业务错误，msg可能为null，提供默认错误信息
      const errorMsg = response.msg || `登录失败，错误码：${response.code}`;
      alert(`登录失败：${errorMsg}`);
    }
  } catch (error: any) {
    console.error('登录失败详情:', error);
    console.error('错误响应:', error.response);
    console.error('错误状态码:', error.response?.status);
    alert('登录失败，请检查网络连接或联系管理员');
  } finally {
    isLoggingIn.value = false;
  }
};
</script>
<style scoped>
.login-page {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: #fff;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #d1fae5;
  margin-bottom: 20px;
}

h2 {
  font-size: 24px;
  margin: 0;
}

h3 {
  font-size: 20px;
  color: #10b981;
  margin: 8px 0;
}

p {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 30px 0;
}

.form-group {
  width: 100%;
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-size: 14px;
  margin-bottom: 5px;
  color: #4b5563;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  box-sizing: border-box;
}

.code-group {
  display: flex;
  gap: 10px;
}

.code-group input {
  flex: 1;
}

.code-btn {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  background-color: #10b981;
  color: #fff;
  cursor: pointer;
  white-space: nowrap;
  min-width: 100px;
}

.code-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.login-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 4px;
  background-color: #10b981;
  color: #fff;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 20px;
}

.tip {
  font-size: 12px;
  color: #9ca3af;
}
</style>