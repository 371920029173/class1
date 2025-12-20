# Cloudflare Pages 部署配置

## 📋 配置检查清单

### ✅ 当前配置状态

1. **Next.js 配置** (`next.config.js`)
   - ✅ `output: 'export'` - 静态导出
   - ✅ `images: { unoptimized: true }` - Cloudflare 兼容
   - ✅ `trailingSlash: true` - URL 兼容

2. **构建配置** (`cloudflare-pages.json`)
   - ✅ `buildCommand: "npm run build"`
   - ✅ `outputDirectory: "out"`
   - ✅ `framework: "nextjs"`
   - ✅ `nodeVersion: "18"`

3. **项目结构**
   - ✅ 所有页面使用 `'use client'`（客户端组件）
   - ✅ 无服务器端功能
   - ✅ 静态资源在 `public/` 目录

## 🚀 部署到 GitHub 仓库 `class1`

### 配置可行性：✅ **完全可行**

所有配置都符合 Cloudflare Pages 的要求，可以安全部署。

### 部署步骤

#### 方法一：通过 Cloudflare Dashboard（推荐）

1. **准备 GitHub 仓库**
   ```bash
   # 初始化 Git（如果还没有）
   git init
   
   # 添加所有文件
   git add .
   
   # 提交
   git commit -m "Initial commit: 一班史记项目"
   
   # 添加远程仓库（替换为你的实际仓库URL）
   git remote add origin https://github.com/371920029173/class1.git
   
   # 推送到 GitHub
   git push -u origin main
   ```

2. **在 Cloudflare Dashboard 中配置**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
   - 进入 **Workers & Pages** → **Pages**
   - 点击 **Create a project**
   - 选择 **Connect to Git**
   - 选择 GitHub 并授权
   - 选择仓库：`371920029173/class1`
   - 配置构建设置：
     - **Framework preset**: `Next.js (Static HTML Export)`
     - **Build command**: `npm run build`
     - **Build output directory**: `out`
     - **Root directory**: `/`（项目根目录）
     - **Node version**: `18`
   - 环境变量（重要）：
     - 名称：`NEXT_PUBLIC_API_URL`
     - 值：你的 Cloudflare Workers URL（例如：`https://history-api.xxxxx.workers.dev`）
   - 点击 **Save and Deploy**

#### 方法二：使用 Wrangler CLI

```bash
# 安装 Wrangler（如果还没有）
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 在项目根目录创建 wrangler.toml（用于 Pages）
# 或者直接使用 cloudflare-pages.json

# 部署
wrangler pages deploy out --project-name=class1
```

## ⚙️ 环境变量配置

在 Cloudflare Pages 设置中添加以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NEXT_PUBLIC_API_URL` | `https://your-worker.workers.dev` | Cloudflare Workers API 地址 |

## 📝 注意事项

1. **必须先部署 Workers API**
   - 确保 Cloudflare Workers 已部署并运行
   - 获取 Workers URL 并配置到环境变量

2. **Git 仓库要求**
   - 仓库必须是 Public 或你有 Cloudflare 访问权限
   - 确保 `.gitignore` 正确配置（已包含 `/out/`）

3. **构建时间**
   - 首次构建可能需要 3-5 分钟
   - 后续构建通常 1-2 分钟

4. **自定义域名**
   - 部署后可以在 Cloudflare Pages 设置中添加自定义域名

## 🔍 验证部署

部署成功后，访问 Cloudflare Pages 提供的 URL（例如：`https://class1.pages.dev`），检查：
- ✅ 页面正常加载
- ✅ 背景图片显示
- ✅ API 连接正常（需要配置 `NEXT_PUBLIC_API_URL`）
- ✅ 所有功能正常

## 🐛 故障排除

如果遇到问题：

1. **构建失败**
   - 检查 Node.js 版本（需要 18+）
   - 检查 `package.json` 中的依赖
   - 查看 Cloudflare Dashboard 中的构建日志

2. **API 连接失败**
   - 确认 `NEXT_PUBLIC_API_URL` 环境变量已设置
   - 确认 Workers API 已部署
   - 检查 CORS 配置

3. **页面空白**
   - 检查浏览器控制台错误
   - 确认所有静态资源路径正确
   - 检查 `out/` 目录是否包含所有文件



