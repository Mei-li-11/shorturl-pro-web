<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { api } from '../../api/shorturl' // ⚠️注意：如果你的 api 文件路径不同，请稍微调整这里

const router = useRouter()
const loading = ref(false)

// 绑定的表单数据
const loginForm = reactive({
  username: '',
  password: ''
})

// 登录按钮的点击事件
const handleLogin = async () => {
  // 1. 简单校验
  if (!loginForm.username || !loginForm.password) {
    ElMessage.warning('账号和密码不能为空！')
    return
  }
  
  loading.value = true
  try {
    // 2. 调用刚才写好的 login 接口
    const res: any = await api.login(loginForm)
    
    // 3. 判断后端返回的状态码（咱们后端成功是返回 200）
    if (res.code === 200) {
      ElMessage.success('登录成功！欢迎回来')
      
      // 🌟 核心动作：把后端发的 Token 锁进浏览器的本地保险箱 (localStorage)
      localStorage.setItem('token', res.token)
      
      // 登录成功后，直接跳转到后台列表页
      router.push('/admin')
    } else {
      ElMessage.error(res.message || '登录失败')
    }
  } catch (error) {
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <el-card class="login-card" shadow="hover">
      <template #header>
        <h2 class="title">🔗 短链接管控台登录</h2>
      </template>
      
      <el-form :model="loginForm" @keyup.enter="handleLogin">
        <el-form-item>
          <el-input 
            v-model="loginForm.username" 
            placeholder="请输入管理员账号 (admin)" 
            size="large" 
          />
        </el-form-item>
        
        <el-form-item>
          <el-input 
            v-model="loginForm.password" 
            type="password" 
            placeholder="请输入密码 (123456)" 
            size="large" 
            show-password 
          />
        </el-form-item>
        
        <el-button 
          type="primary" 
          size="large" 
          class="login-btn" 
          :loading="loading" 
          @click="handleLogin"
        >
          登 录
        </el-button>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
/* 让登录框永远在屏幕正中间的魔法 CSS */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}
.login-card {
  width: 100%;
  max-width: 400px;
}
.title {
  text-align: center;
  margin: 0;
  color: #333;
}
.login-btn {
  width: 100%;
  margin-top: 10px;
}
</style>