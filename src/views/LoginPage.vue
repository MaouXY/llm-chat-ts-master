<template>
  <div id="loginScreen" class="h-full overflow-y-auto">
    <!-- 顶部装饰 -->
    <div class="flex justify-center mb-8 mt-10">
      <div class="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center">
        <i class="fa fa-child text-primary text-5xl"></i>
      </div>
    </div>

    <!-- 主标题 -->
    <div class="text-center mb-10">
      <h1 class="text-3xl font-bold text-dark mb-2">欢迎来到</h1>
      <div class="flex items-center justify-center space-x-2">
        <i class="fa fa-heartbeat text-primary text-xl"></i>
        <h2 class="text-2xl font-bold text-primary">CareSync AI</h2>
      </div>
      <p class="text-neutral mt-2 text-lg">快乐成长的小伙伴</p>
    </div>

    <!-- 登录卡片 -->
    <div class="bg-white rounded-2xl shadow-lg px-6 py-8 m-4">
      <!-- 登录表单 -->
      <form @submit.prevent="handleLogin">
        <!-- 儿童账号输入 -->
        <div class="mb-6">
          <label for="childNo" class="block text-sm font-medium text-neutral mb-2">儿童账号</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-neutral">
              <i class="fa fa-user text-xl"></i>
            </span>
            <input type="text" id="childNo" v-model="childNo"
                   class="w-full px-10 py-4 border border-gray-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-custom text-lg"
                   placeholder="请输入您的账号" readonly>
          </div>
        </div>

        <!-- 验证码输入 -->
        <div class="mb-8">
          <label for="verifyCode" class="block text-sm font-medium text-neutral mb-2">验证码</label>
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-4 flex items-center text-neutral">
              <i class="fa fa-shield text-xl"></i>
            </span>
            <input type="text" id="verifyCode" v-model="verifyCode" maxlength="4"
                   class="w-full px-10 py-4 pr-36 border border-gray-300 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-custom text-lg"
                   placeholder="请输入4位验证码" readonly>
            <button type="button" @click="getVerifyCode"
                    class="absolute inset-y-0 right-0 pr-4 flex items-center text-primary hover:text-primary/80 transition-custom text-lg font-medium">
              获取验证码
            </button>
          </div>
        </div>

        <!-- 登录按钮 -->
        <button type="submit"
                class="w-full bg-primary hover:bg-primary/90 text-white font-medium py-4 px-4 rounded-xl shadow-lg transition-custom transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50 text-lg flex items-center justify-center">
          <i class="fa fa-sign-in mr-2"></i> 登录
        </button>
      </form>

      <!-- 帮助链接 -->
      <div class="mt-6 text-center">
        <p class="text-neutral text-sm">
          忘记账号？请联系您的社工老师
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const childNo = ref('child1234')
const verifyCode = ref('5678')

const getVerifyCode = () => {
  // 模拟获取验证码
  verifyCode.value = Math.floor(1000 + Math.random() * 9000).toString()
}

const handleLogin = () => {
  // 模拟登录逻辑
  console.log('登录信息:', { childNo: childNo.value, verifyCode: verifyCode.value })
  // 跳转到主页
  router.push({ name: 'home' })
}
</script>

<style scoped>
.transition-custom {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>