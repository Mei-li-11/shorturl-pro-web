import Mock from 'mockjs'

// 在内存中维护一份假数据
let list = [
  { id: 1, name: '我的博客', originalUrl: 'https://example.com/blog', shortCode: 'aZ09', status: true, createdAt: '2026-02-28 10:00:00' },
  { id: 2, name: '项目视频', originalUrl: 'https://bilibili.com/video', shortCode: 'xY8b', status: false, createdAt: '2026-02-28 11:30:00' }
]
let nextId = 3

// 1. 列表查询拦截
Mock.mock(RegExp('/api/shortlinks(\\?.*)?'), 'get', (options: any) => {
  const url = new URL(options.url, 'http://localhost')
  const name = url.searchParams.get('name')
  let result = list
  if (name) {
    result = list.filter(item => item.name.includes(name))
  }
  return { code: 200, data: result }
})

// 2. 新增拦截
Mock.mock('/api/shortlinks', 'post', (options: any) => {
  const body = JSON.parse(options.body)
  const newLink = {
    id: nextId++,
    name: body.name,
    originalUrl: body.originalUrl,
    shortCode: Math.random().toString(36).substring(2, 6),
    status: true,
    createdAt: new Date().toLocaleString().replace(/\//g, '-')
  }
  list.unshift(newLink) // 插到最前面
  return { code: 200, message: '新增成功' ,data: newLink}
})

// 3. 删除拦截 (正则匹配 /api/shortlinks/1)
Mock.mock(RegExp('/api/shortlinks/\\d+'), 'delete', (options: any) => {
  const id = parseInt(options.url.split('/').pop())
  list = list.filter(item => item.id !== id)
  return { code: 200, message: '删除成功' }
})

// 4. 启用/禁用拦截
Mock.mock(RegExp('/api/shortlinks/\\d+/(enable|disable)'), 'patch', (options: any) => {
  const parts = options.url.split('/')
  const action = parts.pop() // enable 或 disable
  const id = parseInt(parts.pop())
  const item = list.find(i => i.id === id)
  if (item) {
    item.status = action === 'enable' ? true : false
  }
  return { code: 200, message: '状态更新成功' }
})

// 5. 编辑拦截
Mock.mock(RegExp('/api/shortlinks/\\d+'), 'put', (options: any) => {
  const id = parseInt(options.url.split('/').pop())
  const body = JSON.parse(options.body)
  const item = list.find(i => i.id === id)
  if (item) {
    item.name = body.name
    item.originalUrl = body.originalUrl
  }
  return { code: 200, message: '编辑成功' }
})

console.log('Mock 服务已启动，开始拦截假数据...')