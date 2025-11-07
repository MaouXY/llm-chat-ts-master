<template>
    <div class="login-page">
    <div class="avatar-placeholder"></div>
    <h2>欢迎来到</h2>
    <h3>CareSync AI</h3>
    <p>快乐成长的小伙伴</p>

    <div class="form-group">
      <label>儿童账号</label>
      <input type="text" placeholder="请输入账号" />
    </div>
    <div class="form-group">
      <label>验证码</label>
      <div class="code-group">
        <input type="text" placeholder="请输入验证码" />
        <button>获取验证码</button>
      </div>
    </div>
    <button class="login-btn">登录</button>
    <p class="tip">忘记账号？请联系您的社工老师</p>
  </div>
</template>
<script setup lang="ts">

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

.code-group button {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  background-color: #10b981;
  color: #fff;
  cursor: pointer;
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