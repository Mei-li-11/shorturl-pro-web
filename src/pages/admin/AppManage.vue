<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { api } from '../../api/shorturl' 
import { useRouter } from 'vue-router'

const router = useRouter()

const tableData = ref<any[]>([])
const tableLoading = ref(false)
const dialogVisible = ref(false)
const submitLoading = ref(false)
const selectedIds = ref<number[]>([])

const formRef = ref<FormInstance>()
const formData = ref({ name: '' }) 

const rules = {
  name: [{ required: true, message: '请输入应用名称', trigger: 'blur' }]
}

const loadData = async () => {
  tableLoading.value = true
  try {
    const res: any = await api.getClients()
    tableData.value = res.data.map((item: any) => ({
      ...item,
      _showSecret: false 
    }))
  } catch (error) {
    console.error('获取列表失败', error)
  } finally {
    tableLoading.value = false
  }
}

const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 🌟 核心修改：批量封禁操作
const handleBatchDisable = () => {
  if (selectedIds.value.length === 0) return ElMessage.warning('请先勾选要封禁的应用')
  
  ElMessageBox.confirm(`确定要封禁选中的 ${selectedIds.value.length} 个应用吗？封禁后它们名下的所有短链将立即失效！`, '批量封禁警告', {
    type: 'error',
    confirmButtonText: '立即封禁',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      await api.batchDisableClient(selectedIds.value)
      ElMessage.success('批量封禁成功')
      loadData() 
    } catch (error) {
      console.error(error)
    }
  }).catch(() => {})
}

// 🌟 核心修改：单个状态切换（封禁/解封）
const handleToggleStatus = async (row: any) => {
  try {
    if (row.enabled === true) {
      await api.disableClient(row.id)
      ElMessage.warning(`已封禁应用: ${row.appName}，相关短链已失效`)
    } else {
      await api.enableClient(row.id)
      ElMessage.success(`已解封应用: ${row.appName}，相关短链已恢复`)
    }
    loadData()
  } catch (error) {
    console.error(error)
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        await api.addClient(formData.value)
        ElMessage.success('应用创建成功，已分配专属 AK/SK！')
        dialogVisible.value = false
        loadData() 
      } catch (error) {} finally {
        submitLoading.value = false
      }
    }
  })
}

const handleCopy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    ElMessage.success('已复制到剪贴板！')
  } catch (err) {
    ElMessage.error('复制失败')
  }
}

const goBack = () => {
  router.push('/admin') 
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="list-container">
    <el-card shadow="never">
      <template #header>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0;">🛡️ OpenAPI 应用凭证管理</h3>
          <div>
            <el-button plain size="small" @click="goBack">返回短链管理</el-button>
            
            <el-button 
              type="danger" 
              size="small" 
              :disabled="selectedIds.length === 0" 
              @click="handleBatchDisable"
              style="margin-left: 10px; margin-right: 10px;"
            >
              🚫 批量封禁
            </el-button>

            <el-button type="primary" size="small" @click="dialogVisible = true; formData.name = ''">+ 新建应用</el-button>
          </div>
        </div>
      </template>

      <el-alert 
        title="安全提示：请勿随意物理删除客户，如需阻断调用，请使用【封禁】功能，这将级联熔断该客户所有的短链接。" 
        type="warning" 
        show-icon 
        :closable="false" 
        style="margin-bottom: 20px;" 
      />

      <el-table 
        v-loading="tableLoading" 
        :data="tableData" 
        border 
        style="width: 100%;"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        <el-table-column prop="appName" label="应用名称" width="180" />
        
        <el-table-column label="Access Key (公钥)" width="220">
          <template #default="scope">
            <span class="key-text">{{ scope.row.accessKey }}</span>
            <el-button link type="primary" size="small" @click="handleCopy(scope.row.accessKey)">复制</el-button>
          </template>
        </el-table-column>

        <el-table-column label="Secret Key (私钥)" width="320">
          <template #default="scope">
            <span class="key-text">
              {{ scope.row._showSecret ? scope.row.secretKey : '********************************' }}
            </span>
            <el-button link type="info" size="small" @click="scope.row._showSecret = !scope.row._showSecret">
              {{ scope.row._showSecret ? '隐藏' : '显示' }}
            </el-button>
            <el-button link type="primary" size="small" @click="handleCopy(scope.row.secretKey)">复制</el-button>
          </template>
        </el-table-column>

        <el-table-column prop="enabled" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.enabled ? 'success' : 'danger'">
              {{ scope.row.enabled ? '正常接入' : '已封禁' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="开通时间" width="180" />
        
        <el-table-column label="操作" fixed="right">
          <template #default="scope">
            <el-button 
              size="small" 
              :type="scope.row.enabled ? 'danger' : 'success'" 
              plain
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.enabled ? '封禁应用' : '解封应用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" title="新增 OpenAPI 应用" width="450px">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="90px" @submit.prevent>
        <el-form-item label="应用名称" prop="name">
          <el-input v-model="formData.name" placeholder="例：淘宝营销系统 / 内部OA短信" />
        </el-form-item>
        <div class="form-tip">注：系统将自动为该应用生成 16位的 AccessKey 和 32位的 SecretKey。</div>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="submitForm">确认并生成密钥</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
/* 样式保持不变... */
.list-container { padding: 20px; max-width: 1400px; margin: 0 auto; }
.key-text { font-family: 'Courier New', Courier, monospace; background-color: #f4f4f5; padding: 2px 6px; border-radius: 4px; margin-right: 8px; font-size: 13px; color: #606266; }
.form-tip { margin-left: 90px; font-size: 12px; color: #909399; margin-top: -10px; }
</style>