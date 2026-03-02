import axios from 'axios'
import { ElMessage } from 'element-plus'

// 1. 创建 axios 实例
const http = axios.create({
  baseURL: 'http://localhost:8080', 
  timeout: 5000
})

// 👇 请求拦截器 (出门前：自动从兜里拿 Token 贴在头上)
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      // 按照行业规范，在请求头带上 Authorization: Bearer xxxxx
      config.headers['Authorization'] = 'Bearer ' + token
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 👇 🌟 核心升级：响应拦截器 (回家后：剥开包装，严格查验！)
http.interceptors.response.use(
  (response) => {
    // 获取后端真正返回的数据（比如咱们封装的 {code: 200, data: ...} 或 {code: 429, message: ...}）
    const res = response.data

    // 🌟 核心拦截逻辑：只要后端返回了 code，并且 code 不是 200，统统当做报错处理！
    if (res.code && res.code !== 200) {
      // 直接把后端写的 "小伙子手速太快啦！" 弹出来提示用户！
      ElMessage.error(res.message || '操作失败')
      
      // 强行中断代码，阻止页面继续去读取不存在的 data，完美消除控制台红字！
      return Promise.reject(new Error(res.message || '业务报错'))
    }

    // 如果 code 是 200，说明真的成功了，放行！
    return res
  },
  (error) => {
    // 🌟 处理严重的 HTTP 状态码错误（比如 401 未登录、403 Token过期或伪造）
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      ElMessage.error('登录已失效或无权限，请重新登录')
      localStorage.removeItem('token') // 必须清空没用的废弃钥匙！
      window.location.href = '/login'  // 强制踢回登录页
    } else {
      ElMessage.error(error.message || '网络请求失败')
    }
    return Promise.reject(error)
  }
)

export default http