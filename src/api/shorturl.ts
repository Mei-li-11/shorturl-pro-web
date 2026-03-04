import http from './http'

export const api = {
  // 获取列表 (GET /api/shortlinks)
  getList: (name?: string) => http.get('/api/shortlinks', { params: { name } }),
  
  // 后台新增 (POST /api/shortlinks) - 永久有效
  add: (data: { name: string; originalUrl: string }) => http.post('/api/shortlinks', data),
  
  // 编辑 (PUT /api/shortlinks/:id)
  update: (id: number, data: { name: string; originalUrl: string }) => http.put(`/api/shortlinks/${id}`, data),
  
  // 删除 (DELETE /api/shortlinks/:id)
  remove: (id: number) => http.delete(`/api/shortlinks/${id}`),
  
  // 启用 (PATCH /api/shortlinks/:id/enable)
  enable: (id: number) => http.patch(`/api/shortlinks/${id}/enable`),
  
  // 禁用 (PATCH /api/shortlinks/:id/disable)
  disable: (id: number) => http.patch(`/api/shortlinks/${id}/disable`),
  
  // 演示页生成短链 (POST /api/shortlinks/generate) - 1天有效 + 防刷
  generate: (data: { name: string; originalUrl: string }) => http.post('/api/shortlinks/generate', data),

  login: (data: any) => { return http.post('/api/auth/login', data) },

  // ==========================================
  // OpenAPI 应用管理 (AK/SK) 接口 - 状态流转版
  // ==========================================
  getClients: () => http.get('/api/admin/clients'),
  addClient: (data: { name: string }) => http.post('/api/admin/clients', data),
  
  // 🌟 新增：封禁与解封单个应用
  enableClient: (id: number) => http.patch(`/api/admin/clients/${id}/enable`),
  disableClient: (id: number) => http.patch(`/api/admin/clients/${id}/disable`),

  // ==========================================
  // 批量与清理的高级接口
  // ==========================================
  
  // 批量删除短链 (这个保留，因为垃圾短链确实需要清理)
  batchRemove: (ids: number[]) => http.delete('/api/shortlinks/batch', { data: ids }),
  
  // 清理过期短链
  removeExpired: () => http.delete('/api/shortlinks/expired'),
  
  // 🌟 修改：批量封禁 API 客户
  batchDisableClient: (ids: number[]) => http.patch('/api/admin/clients/batch/disable', ids)
}