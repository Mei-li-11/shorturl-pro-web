# ShortURL Pro - 短链接服务系统 (前端工程)

本项目是一个基于 Vue 3 + TypeScript + Vite 构建的短链接管理后台与演示页面，主要包含前台短链自助生成功能与后台完整的短链管控 (CRUD) 能力，以及新增的OpenAPI应用管理功能。

## 1. 项目简介

ShortURL Pro 是一个专业的短链接服务系统，旨在提供简单、高效的 URL 缩短服务，帮助用户管理和追踪短链接的使用情况。系统分为前台演示页面和后台管理系统两部分，新增了OpenAPI应用管理功能，支持API密钥的生成和管理。

### 主要功能
- 📱 前台短链接生成与展示
- 🔧 后台短链接管理（创建、查看、编辑、删除）
- 📊 短链接访问统计
- 🔐 后台用户登录认证
- 🔑 OpenAPI应用管理（生成AK/SK、封禁/解封应用）
- 🎨 响应式设计，适配多种设备

## 2. 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue 3 | ^3.5.29 | 前端框架 |
| TypeScript | ~5.9.3 | 类型系统 |
| Vite | ^7.3.1 | 构建工具 |
| Element Plus | ^2.13.2 | UI 组件库 |
| Vue Router | ^5.0.3 | 路由管理 |
| Pinia | ^3.0.4 | 状态管理 |
| Axios | ^1.13.6 | HTTP 客户端 |
| Mock.js | ^1.1.0 | 模拟数据 |

## 3. 环境要求

- **Node.js**: 建议使用较新的 LTS 版本 (如 v18+)
- **包管理器**: 推荐使用 `npm` 或 `pnpm`
- **IDE**: 推荐使用 VS Code，并安装 `Vue - Official` (Volar) 插件

## 4. 启动与打包命令

```bash
# 安装项目依赖
npm install

# 启动本地开发服务器
npm run dev

# 生产环境打包构建
npm run build

# 预览生产构建
npm run preview

# 类型检查
npm run type-check

# 代码 lint
npm run lint

# 代码格式化
npm run format
```

## 5. 项目结构

```
shorturl-pro-web/
├── public/             # 静态资源
├── src/
│   ├── api/           # API 接口定义
│   │   ├── http.ts    # HTTP 客户端配置
│   │   └── shorturl.ts # 短链接相关接口
│   ├── mocks/         # 模拟数据
│   ├── pages/         # 页面组件
│   │   ├── admin/     # 后台管理页面
│   │   │   ├── ListPage.vue    # 短链接列表页面
│   │   │   ├── LoginPage.vue   # 登录页面
│   │   │   └── AppManage.vue   # OpenAPI应用管理页面
│   │   └── demo/      # 前台演示页面
│   │       └── DemoPage.vue    # 短链接生成演示页面
│   ├── router/        # 路由配置
│   ├── stores/        # 状态管理
│   ├── App.vue        # 根组件
│   └── main.ts        # 入口文件
├── .gitignore         # Git 忽略文件
├── package.json       # 项目配置
├── tsconfig.json      # TypeScript 配置
└── vite.config.ts     # Vite 配置
```

## 6. 核心功能说明

### 6.1 前台短链接生成
- 用户可以输入长 URL 并生成短链接
- 支持自定义短链接后缀（可选）
- 提供生成的短链接复制功能
- 展示短链接的使用统计信息

### 6.2 后台管理系统
- 用户登录认证
- 短链接列表展示
- 短链接创建、编辑、删除
- 短链接访问统计查看
- 支持按条件筛选和搜索

### 6.3 OpenAPI应用管理
- 新建应用并自动生成Access Key和Secret Key
- 查看所有应用的状态和密钥信息
- 单个应用的封禁/解封操作
- 批量封禁应用功能
- 安全提示：封禁应用会级联熔断该客户所有的短链接

## 7. API 接口

项目使用 Mock.js 模拟 API 响应，主要接口包括：

### 7.1 短链接管理接口
- **GET /api/shortlinks** - 获取短链接列表
- **POST /api/shortlinks** - 创建短链接（后台）
- **PUT /api/shortlinks/:id** - 更新短链接
- **DELETE /api/shortlinks/:id** - 删除短链接
- **PATCH /api/shortlinks/:id/enable** - 启用短链接
- **PATCH /api/shortlinks/:id/disable** - 禁用短链接
- **POST /api/shortlinks/generate** - 生成短链接（前台）
- **DELETE /api/shortlinks/batch** - 批量删除短链接
- **DELETE /api/shortlinks/expired** - 清理过期短链接

### 7.2 用户认证接口
- **POST /api/auth/login** - 用户登录

### 7.3 OpenAPI应用管理接口
- **GET /api/admin/clients** - 获取应用列表
- **POST /api/admin/clients** - 创建应用
- **PATCH /api/admin/clients/:id/enable** - 启用应用
- **PATCH /api/admin/clients/:id/disable** - 禁用应用
- **PATCH /api/admin/clients/batch/disable** - 批量禁用应用

## 8. 部署说明

### 8.1 生产构建

```bash
# 执行构建命令
npm run build

# 构建产物将生成在 dist/ 目录
```

### 8.2 部署方式

- **静态托管**: 将 `dist` 目录部署到任何静态文件服务器（如 Nginx、Apache、GitHub Pages 等）
- **容器部署**: 可使用 Docker 容器化部署
- **云服务**: 可部署到 Vercel、Netlify、AWS S3 等云服务

## 9. 开发指南

### 9.1 代码规范

- 使用 TypeScript 进行类型检查
- 遵循 ESLint 代码规范
- 使用 Prettier 进行代码格式化

### 9.2 提交规范

建议使用语义化提交消息，格式如下：

```
<type>(<scope>): <description>

<body>

<footer>
```

其中 `type` 包括：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码风格调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建或依赖更新

## 10. 许可证

MIT License

## 11. 联系方式

- **项目地址**: https://github.com/Mei-li-11/shorturl-pro-web
- **作者**: Mei-li-11

---

感谢使用 ShortURL Pro！如果您有任何问题或建议，欢迎提交 Issue 或 Pull Request。