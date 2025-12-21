# 🚀 快速部署步骤 - GitHub 仓库 class1

## ✅ 配置确认

**当前配置完全可行！** 所有设置都符合 Cloudflare Pages 的要求。

## 📦 部署前准备

### 1. 确保 Workers API 已部署

如果还没有部署 Workers API，请先部署：
```bash
cd workers
wrangler deploy
```

### 2. 记录 Workers URL

部署 Workers 后会显示 URL，例如：
```
https://history-api.xxxxx.workers.dev
```

## 🔧 部署步骤

### 步骤 1: 初始化 Git 仓库（如果还没有）

```powershell
# 检查是否已有 Git 仓库
git status

# 如果没有，初始化
git init
```

### 步骤 2: 添加远程仓库

```powershell
# 添加 GitHub 远程仓库
git remote add origin https://github.com/371920029173/class1.git

# 或者如果已存在，更新 URL
git remote set-url origin https://github.com/371920029173/class1.git
```

### 步骤 3: 提交所有文件

```powershell
# 添加所有文件
git add .

# 提交
git commit -m "部署到 Cloudflare Pages: 一班史记项目"
```

### 步骤 4: 推送到 GitHub

```powershell
# 推送到 main 分支
git push -u origin main

# 如果遇到错误，可能需要先拉取
git pull origin main --allow-unrelated-histories
```

### 步骤 5: 在 Cloudflare Dashboard 中配置

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages** → **Pages**
3. 点击 **Create a project**
4. 选择 **Connect to Git**
5. 选择 GitHub 并授权
6. 选择仓库：`371920029173/class1`
7. 配置构建设置：
   - **Framework preset**: `Next.js (Static HTML Export)`
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Root directory**: `/`（留空或填 `/`）
   - **Node version**: `18`
8. **环境变量**（重要！）：
   - 点击 **Add environment variable**
   - 名称：`NEXT_PUBLIC_API_URL`
   - 值：你的 Workers URL（例如：`https://history-api.xxxxx.workers.dev`）
9. 点击 **Save and Deploy**

### 步骤 6: 等待部署完成

- 首次构建需要 3-5 分钟
- 可以在 Dashboard 中查看构建日志
- 部署成功后会显示 Pages URL

## ✅ 验证部署

部署成功后：
1. 访问 Cloudflare Pages 提供的 URL
2. 检查页面是否正常加载
3. 测试上传功能（需要正确的 API URL）
4. 检查所有页面是否正常

## 🔄 后续更新

每次更新代码后：
```powershell
git add .
git commit -m "更新描述"
git push origin main
```

Cloudflare Pages 会自动触发新的构建和部署。





