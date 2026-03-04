<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { api } from '../../api/shorturl'
import { useRouter } from 'vue-router' // 🌟 新增：引入 Vue Router 路由钩子

// 响应式状态变量
const originalUrl = ref('')
const shortUrl = ref('')
const isGenerating = ref(false)
const showResult = ref(false)

// 🌟 新增：实例化 router 并编写跳转方法
const router = useRouter()
const goToLogin = () => {
  router.push('/login')
}

// 真实生成短链的方法
const handleGenerate = async () => {
  if (!originalUrl.value) {
    ElMessage.warning('请输入需要转换的长链接！')
    return
  }

  isGenerating.value = true // 开启按钮 loading
  
  try {
    // 向真实后端发送请求
    const res: any = await api.generate({
      originalUrl: originalUrl.value,
      name: '前台自助生成' 
    })

    // 从后端返回的数据里掏出真实短码
    const realShortCode = res.data.shortCode
    
    // 拼装出完整的短链接地址展现给用户
    shortUrl.value = `http://localhost:8080/${realShortCode}`
    
    showResult.value = true
    ElMessage.success('真实短链接生成成功！')
  } catch (error) {
    console.error('请求被拦截或发生错误：', error)
  } finally {
    isGenerating.value = false // 关闭 loading
  }
}

// 复制短链到剪贴板
const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(shortUrl.value)
    ElMessage.success('已成功复制到剪贴板！')
  } catch (err) {
    ElMessage.error('复制失败，请手动选中复制')
  }
}
</script>

<template>
  <div class="demo-container">
    
    <div class="header-nav">
      <el-button type="primary" plain round @click="goToLogin">
        后台管理系统 ➔
      </el-button>
    </div>

    <el-card class="demo-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <h2>🔗 URL 短链生成器</h2>
        </div>
      </template>
      
      <div class="form-area">
        <el-input 
          v-model="originalUrl" 
          placeholder="请输入长链接，例如：https://example.com/very-long-url" 
          size="large"
          clearable
          @keyup.enter="handleGenerate"
        >
          <template #append>
            <el-button 
              type="primary" 
              :loading="isGenerating" 
              @click="handleGenerate"
            >
              生成短链
            </el-button>
          </template>
        </el-input>
      </div>

      <div v-if="showResult" class="result-area">
        <el-divider>生成结果</el-divider>
        <el-alert 
          title="提示：您可以将此短链复制到浏览器地址栏中进行测试" 
          type="info" 
          show-icon 
          :closable="false" 
          style="margin-bottom: 15px;" 
        />
        
        <el-input v-model="shortUrl" readonly size="large">
          <template #append>
            <el-button @click="handleCopy" type="success">复制链接</el-button>
          </template>
        </el-input>
      </div>
    </el-card>
  </div>
</template>

<style scoped>
/* 页面居中布局 */
.demo-container {
  position: relative; /* 🌟 新增：设置为相对定位，作为绝对定位按钮的父级参考 */
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh; /* 撑满整个屏幕高度 */
  background-color: #f5f7fa;
  padding: 20px;
}

/* 🌟 新增：让登录按钮绝对定位在右上角 */
.header-nav {
  position: absolute;
  top: 30px;
  right: 40px;
}

/* 卡片样式 */
.demo-card {
  width: 100%;
  max-width: 700px;
}

.card-header {
  text-align: center;
}

.card-header h2 {
  margin: 0;
  color: #303133;
}

.form-area {
  margin: 20px 0;
}

/* 结果区渐显动画 */
.result-area {
  margin-top: 30px;
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>