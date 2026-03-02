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
  
  // 👇 🌟 核心修改：演示页生成短链 (POST /api/shortlinks/generate) - 1天有效 + 防刷
  generate: (data: { name: string; originalUrl: string }) => http.post('/api/shortlinks/generate', data),

  login: (data: any) => { return http.post('/api/auth/login', data) }
}