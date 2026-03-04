<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { api } from '../../api/shorturl'
import { useRouter } from 'vue-router'

const router = useRouter()

// --- 状态定义 ---
const searchForm = reactive({ name: '' })
const tableData = ref<any[]>([])
const tableLoading = ref(false) 
const submitLoading = ref(false) 

// 🌟 新增：存放被勾选的行 ID 集合
const selectedIds = ref<number[]>([])

const dialogVisible = ref(false)
const dialogTitle = ref('新增短链')
const currentEditId = ref<number | null>(null)

const formRef = ref<FormInstance>()
const formData = reactive({ name: '', originalUrl: '' })

const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入短链接名称', trigger: 'blur' }],
  originalUrl: [
    { required: true, message: '请输入原始链接', trigger: 'blur' },
    { pattern: /^https?:\/\/.+/, message: '请输入正确的URL，需以 http:// 或 https:// 开头', trigger: 'blur' }
  ]
})

// --- 核心操作方法 ---

const loadData = async () => {
  tableLoading.value = true
  try {
    const res: any = await api.getList(searchForm.name)
    tableData.value = res.data 
  } catch (error) {
    console.error('获取列表失败', error)
  } finally {
    tableLoading.value = false
  }
}

// 🌟 新增：监听表格多选框变化
const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map(item => item.id)
}

// 🌟 新增：批量删除操作
const handleBatchDelete = () => {
  if (selectedIds.value.length === 0) return ElMessage.warning('请先勾选要删除的数据')
  
  ElMessageBox.confirm(`确定要永久删除选中的 ${selectedIds.value.length} 条短链吗？`, '批量删除警告', {
    type: 'error',
    confirmButtonText: '确定删除',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      await api.batchRemove(selectedIds.value)
      ElMessage.success('批量删除成功')
      loadData() 
    } catch (error) {
      console.error(error)
    }
  }).catch(() => {})
}

// 🌟 新增：清理过期垃圾操作
const handleCleanExpired = () => {
  ElMessageBox.confirm('这将会扫描并永久删除所有已过期的 24小时演示短链，确定执行吗？', '清理过期垃圾', {
    type: 'warning',
    confirmButtonText: '立即清理',
    cancelButtonText: '取消'
  }).then(async () => {
    try {
      const res: any = await api.removeExpired()
      ElMessage.success(res.message || '清理完成')
      loadData() 
    } catch (error) {
      console.error(error)
    }
  }).catch(() => {})
}

const handleAdd = () => {
  dialogTitle.value = '新增短链'
  currentEditId.value = null
  formData.name = ''
  formData.originalUrl = ''
  dialogVisible.value = true
  setTimeout(() => formRef.value?.clearValidate(), 0)
}

const handleEdit = (row: any) => {
  dialogTitle.value = '编辑短链'
  currentEditId.value = row.id
  formData.name = row.name
  formData.originalUrl = row.originalUrl
  dialogVisible.value = true
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true 
      try {
        if (currentEditId.value) {
          await api.update(currentEditId.value, formData)
          ElMessage.success('编辑成功')
        } else {
          await api.add(formData)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        loadData() 
      } catch (error) {} finally {
        submitLoading.value = false 
      }
    }
  })
}

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除短链 "${row.name}" 吗？`, '警告', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    await api.remove(row.id)
    ElMessage.success('删除成功')
    loadData() 
  }).catch(() => {})
}

const handleToggleStatus = async (row: any) => {
  try {
    if (row.status === true) {
      await api.disable(row.id)
      ElMessage.warning(`已禁用: ${row.name}`)
    } else {
      await api.enable(row.id)
      ElMessage.success(`已启用: ${row.name}`)
    }
    loadData() 
  } catch (error) {
    console.error(error)
  }
}

const handleCopy = async (shortCode: string) => {
  const fullUrl = `http://localhost:8080/${shortCode}`
  try {
    await navigator.clipboard.writeText(fullUrl)
    ElMessage.success('短链接已复制：' + fullUrl)
  } catch (err) {
    ElMessage.error('复制失败，请手动复制')
  }
}

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出当前账号吗？', '退出提示', {
    confirmButtonText: '确定退出',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    localStorage.removeItem('token') 
    ElMessage.success('已安全退出')
    router.push('/login') 
  }).catch(() => {})
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
          <h3 style="margin: 0;">🔗 短链接管控后台</h3>
          <div>
            <el-button size="small" @click="router.push('/demo')">
              🏠 返回前台
            </el-button>

            <el-button type="primary" plain size="small" @click="router.push('/admin/apps')" style="margin-left: 10px;">
              ⚙️ API 应用管理
            </el-button>
            
            <el-button type="danger" plain size="small" @click="handleLogout" style="margin-left: 10px;">
              退出登录
            </el-button>
          </div>
        </div>
      </template>

      <div class="header-actions">
        <el-form :inline="true" :model="searchForm" @submit.prevent>
          <el-form-item label="短链接名称">
            <el-input v-model="searchForm.name" placeholder="请输入名称搜索" clearable @keyup.enter="loadData" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadData">查询</el-button>
          </el-form-item>
        </el-form>
        
        <div>
          <el-button type="warning" plain @click="handleCleanExpired">
            🧹 清理过期
          </el-button>
          <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
            🗑️ 批量删除
          </el-button>
          <el-button type="success" @click="handleAdd">
            ➕ 新增短链
          </el-button>
        </div>
      </div>

      <el-table 
        v-loading="tableLoading" 
        :data="tableData" 
        border 
        style="width: 100%; margin-top: 15px;"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" align="center" />
        
        <el-table-column prop="name" label="名称" width="180" />
        <el-table-column prop="shortCode" label="短链接" width="180">
          <template #default="scope">
            <el-tag type="info" style="margin-right: 8px;">{{ scope.row.shortCode }}</el-tag>
            <el-button link type="primary" size="small" @click="handleCopy(scope.row.shortCode)">
              复制
            </el-button>
          </template>
        </el-table-column>
        <el-table-column prop="originalUrl" label="原始长链接" show-overflow-tooltip />
        <el-table-column prop="clickCount" label="访问次数" width="100" align="center" />
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === true ? 'success' : 'danger'">
              {{ scope.row.status === true ? '已启用' : '已禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="230" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button 
              size="small" 
              :type="scope.row.status === true ? 'warning' : 'success'"
              @click="handleToggleStatus(scope.row)"
            >
              {{ scope.row.status === true ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="500px">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px" @submit.prevent>
        <el-form-item label="名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入短链接名称" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="原始链接" prop="originalUrl">
          <el-input v-model="formData.originalUrl" placeholder="需包含 http:// 或 https://" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="submitForm">确认提交</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.list-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
</style>