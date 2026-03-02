<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { api } from '../../api/shorturl'
import { useRouter } from 'vue-router'

// --- 状态定义 ---
const searchForm = reactive({ name: '' })
const tableData = ref<any[]>([])
const tableLoading = ref(false) // 表格加载锁
const submitLoading = ref(false) // 提交按钮防重复点击锁

const router = useRouter()

const dialogVisible = ref(false)
const dialogTitle = ref('新增短链')
const currentEditId = ref<number | null>(null)

// 表单相关
const formRef = ref<FormInstance>()
const formData = reactive({ name: '', originalUrl: '' })

// 表单校验规则（对应文档：URL必填+格式校验）
const rules = reactive<FormRules>({
  name: [{ required: true, message: '请输入短链接名称', trigger: 'blur' }],
  originalUrl: [
    { required: true, message: '请输入原始链接', trigger: 'blur' },
    { pattern: /^https?:\/\/.+/, message: '请输入正确的URL，需以 http:// 或 https:// 开头', trigger: 'blur' }
  ]
})

// --- 核心操作方法 ---

// 1. 获取/搜索列表
const loadData = async () => {
  tableLoading.value = true
  try {
    const res: any = await api.getList(searchForm.name)
    tableData.value = res.data // 绑定后端返回的数据
  } catch (error) {
    console.error('获取列表失败', error)
  } finally {
    tableLoading.value = false
  }
}

// 2. 点击新增按钮
const handleAdd = () => {
  dialogTitle.value = '新增短链'
  currentEditId.value = null
  formData.name = ''
  formData.originalUrl = ''
  dialogVisible.value = true
  // 清除上次的校验提示
  setTimeout(() => formRef.value?.clearValidate(), 0)
}

// 3. 点击编辑按钮
const handleEdit = (row: any) => {
  dialogTitle.value = '编辑短链'
  currentEditId.value = row.id
  formData.name = row.name
  formData.originalUrl = row.originalUrl
  dialogVisible.value = true
}

// 4. 提交表单 (新增或编辑)
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true // 开启按钮 loading，防止连点
      try {
        if (currentEditId.value) {
          await api.update(currentEditId.value, formData)
          ElMessage.success('编辑成功')
        } else {
          await api.add(formData)
          ElMessage.success('新增成功')
        }
        dialogVisible.value = false
        loadData() // 操作成功后刷新列表
      } catch (error) {
        // 错误由 http 拦截器处理
      } finally {
        submitLoading.value = false // 解除 loading
      }
    }
  })
}

// 5. 删除操作
const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除短链 "${row.name}" 吗？`, '警告', {
    type: 'warning',
    confirmButtonText: '确定',
    cancelButtonText: '取消'
  }).then(async () => {
    await api.remove(row.id)
    ElMessage.success('删除成功')
    loadData() // 刷新列表
  }).catch(() => {})
}

// 6. 启用/禁用操作
const handleToggleStatus = async (row: any) => {
  try {
    if (row.status === true) {
      await api.disable(row.id)
      ElMessage.warning(`已禁用: ${row.name}`)
    } else {
      await api.enable(row.id)
      ElMessage.success(`已启用: ${row.name}`)
    }
    loadData() // 刷新列表保证一致性
  } catch (error) {
    console.error(error)
  }
}

// 7. 复制完整短链接到剪贴板
const handleCopy = async (shortCode: string) => {
  // 拼装出完整的可跳转链接
  const fullUrl = `http://localhost:8080/${shortCode}`
  try {
    await navigator.clipboard.writeText(fullUrl)
    ElMessage.success('短链接已复制：' + fullUrl)
  } catch (err) {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 8. 退出登录操作
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出当前账号吗？', '退出提示', {
    confirmButtonText: '确定退出',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    localStorage.removeItem('token') // 删掉本地的过期钥匙
    ElMessage.success('已安全退出')
    router.push('/login') // 跳转回登录页
  }).catch(() => {})
}

// 初始化页面时加载数据
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
          <el-button type="danger" plain size="small" @click="handleLogout">退出登录</el-button>
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
        <el-button type="success" @click="handleAdd">新增短链</el-button>
      </div>

      <el-table v-loading="tableLoading" :data="tableData" border style="width: 100%; margin-top: 15px;">
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
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === true ? 'success' : 'danger'">
              {{ scope.row.status === true ? '已启用' : '已禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180" />
        <el-table-column label="操作" width="280" fixed="right">
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