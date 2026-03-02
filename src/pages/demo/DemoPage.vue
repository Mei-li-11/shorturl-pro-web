<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { api } from '../../api/shorturl'
// 响应式状态变量
const originalUrl = ref('')
const shortUrl = ref('')
const isGenerating = ref(false)
const showResult = ref(false)

// 真实生成短链的方法
const handleGenerate = async () => {
  if (!originalUrl.value) {
    ElMessage.warning('请输入需要转换的长链接！')
    return
  }

  isGenerating.value = true // 开启按钮 loading
  
  try {
    // 🌟 1. 向真实后端发送请求！因为前台用户没填名称，我们给个默认名字
    const res: any = await api.generate({
      originalUrl: originalUrl.value,
      name: '前台自助生成' 
    })

    // 🌟 2. 从后端返回的数据里，掏出刚刚在数据库里生成的真实短码
    const realShortCode = res.data.shortCode
    
    // 🌟 3. 拼装出完整的短链接地址展现给用户
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
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh; /* 撑满整个屏幕高度 */
  background-color: #f5f7fa;
  padding: 20px;
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