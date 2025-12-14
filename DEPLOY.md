# 部署指南

## 🚀 快速开始

### 1. 安装依赖（工具下载到C盘）

**Windows PowerShell:**
```powershell
# 运行安装脚本（自动配置C盘路径）
.\setup.ps1

# 或手动配置
npm config set cache "C:\npm-cache" --global
npm config set prefix "C:\npm-global" --global
npm install
```

### 2. 开发模式

```bash
npm run dev
```

访问 http://localhost:3000

### 3. 构建静态文件

```bash
npm run build
```

构建后的文件在 `out/` 目录。

## ☁️ 部署到 Cloudflare Pages

### 方法一：通过 Git 仓库

1. **推送代码到 GitHub/GitLab**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **在 Cloudflare Dashboard 中连接**
   - 登录 Cloudflare Dashboard
   - 进入 Pages → Create a project
   - 连接到你的 Git 仓库

3. **配置构建设置**
   - **Framework preset**: Next.js (Static HTML Export)
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Root directory**: `/` (项目根目录)
   - **Node version**: 18 或更高

4. **环境变量**（如果需要）
   - 通常不需要，因为是完全静态的

5. **部署**
   - 点击 "Save and Deploy"
   - 等待构建完成

### 方法二：直接上传

1. **本地构建**
   ```bash
   npm run build
   ```

2. **上传 out 目录**
   - 在 Cloudflare Pages 中选择 "Upload assets"
   - 上传整个 `out` 目录的内容

## 📝 注意事项

- ✅ 完全静态，无需服务器
- ✅ 数据存储在浏览器 IndexedDB（客户端）
- ✅ 支持导入/导出 JSON 备份
- ✅ 所有工具和缓存默认下载到 C 盘（通过 .npmrc 和 setup.ps1 配置）

## 🔧 故障排除

### 构建失败

如果构建失败，检查：
1. Node.js 版本 >= 18
2. 所有依赖已正确安装
3. TypeScript 编译无错误

### 运行时错误

如果页面加载错误：
1. 检查浏览器控制台
2. 确保浏览器支持 IndexedDB
3. 检查网络连接（如果需要加载外部资源）

## 📊 性能优化

- IndexedDB 使用索引加速查询
- 分页加载（默认100条）
- 懒加载和虚拟滚动（可扩展）
- 静态资源优化



