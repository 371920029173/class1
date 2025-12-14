# 🚀 完整部署指南 - 一班史记

> **重要提示**：本项目需要部署到 Cloudflare 才能正常使用，因为数据存储在 Cloudflare KV 中，API 运行在 Cloudflare Workers 上。

## 📋 部署前准备

### 1. 确认密钥配置

密钥已硬编码在代码中，无需手动配置：
- **上传密钥**: `ssfz2027n15662768895`
- **删除密钥**: `ssfz2027371920029173`

这些密钥在以下文件中：
- `lib/api-client.ts` - 客户端使用
- `workers/wrangler.toml` - Workers 配置

### 2. 需要的账户和服务

- Cloudflare 账户（免费）
- GitHub/GitLab 账户（用于代码托管，可选）

---

## 🚀 第一步：部署 Cloudflare Workers API

### 1.1 安装 Wrangler CLI

**Windows PowerShell（推荐）**：

```powershell
npm install -g wrangler
```

或者使用 npx（推荐，不全局安装）：

```powershell
npx wrangler --version
```

**注意**：如果遇到权限问题，可能需要以管理员身份运行 PowerShell。

### 1.2 登录 Cloudflare

```bash
wrangler login
```

这会打开浏览器，登录你的 Cloudflare 账号。

### 1.3 创建 KV 命名空间

#### 方法一：使用 Dashboard（推荐，最简单）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages** → **KV**
3. 点击 **Create a namespace**
4. 输入名称：`history-pro-kv`（或任意名称）
5. 点击 **Add**
6. **重要**：复制生成的 **Namespace ID**（类似：`xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）
   - 这个 ID 会在下一步用到

#### 方法二：使用 CLI（高级用户）

```powershell
wrangler kv:namespace create "HISTORY_KV"
```

会输出类似：
```
🌀  Creating namespace with title "history-api-HISTORY_KV"
✨  Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "HISTORY_KV", id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" }
```

**复制输出的 ID**，下一步会用到。

### 1.4 配置 wrangler.toml

编辑 `workers/wrangler.toml` 文件：

**找到这一行**：
```toml
id = "your-kv-namespace-id"  # 替换为实际的 KV 命名空间 ID
```

**替换为**：
```toml
id = "你从步骤1.3复制的KV命名空间ID"
```

**示例**（假设你的 KV ID 是 `abc123def456...`）：
```toml
[[kv_namespaces]]
binding = "HISTORY_KV"
id = "abc123def456ghi789jkl012mno345pqr678stu901vwx234yz"
```

**注意**：密钥已经硬编码在文件中，无需修改。

### 1.5 部署 Workers

在项目根目录打开 PowerShell，执行：

```powershell
cd workers
wrangler deploy
```

**首次部署**可能需要确认，输入 `y` 或直接回车。

部署成功后会显示：
```
✨  Deployed to production
   https://history-api.your-subdomain.workers.dev
```

**重要**：
1. **复制这个 URL**（类似：`https://history-api.xxxxx.workers.dev`）
2. 这个 URL 就是你的 API 地址
3. 下一步会用到这个 URL

---

## 🌐 第二步：配置前端环境变量

### 2.1 创建环境变量文件

在项目根目录（`E:\360MoveData\Users\user\Desktop\hidtory`）创建 `.env.local` 文件：

**方法一：使用 PowerShell**

```powershell
cd E:\360MoveData\Users\user\Desktop\hidtory
echo "NEXT_PUBLIC_API_URL=https://history-api.your-subdomain.workers.dev" > .env.local
```

**方法二：手动创建**

1. 在项目根目录创建新文件，命名为 `.env.local`
2. 打开文件，输入：
   ```
   NEXT_PUBLIC_API_URL=https://history-api.your-subdomain.workers.dev
   ```
3. 将 `https://history-api.your-subdomain.workers.dev` 替换为步骤 1.5 中复制的实际 URL

**示例**（假设你的 Workers URL 是 `https://history-api.abc123.workers.dev`）：
```
NEXT_PUBLIC_API_URL=https://history-api.abc123.workers.dev
```

### 2.2 验证环境变量

- `.env.local` 文件已在 `.gitignore` 中，不会提交到 Git
- 这个文件只用于本地开发
- 生产环境需要在 Cloudflare Pages 中设置（见第四步）

---

## 📦 第三步：构建前端

### 3.1 安装依赖

在项目根目录执行：

```powershell
npm install
```

**注意**：如果之前配置了 npm 缓存到 C 盘，依赖会下载到 `C:\npm-cache`。

### 3.2 构建项目

```powershell
npm run build
```

构建过程可能需要几分钟，请耐心等待。

**构建成功标志**：
- 看到 `✓ Compiled successfully` 或类似提示
- 在项目根目录生成 `out/` 文件夹
- `out/` 文件夹中包含 `index.html` 等静态文件

**如果构建失败**：
- 检查 `.env.local` 文件是否存在且格式正确
- 确认所有依赖已安装：`npm install`
- 查看错误信息，通常是缺少依赖或配置错误

---

## ☁️ 第四步：部署到 Cloudflare Pages

### 方法一：通过 Git 仓库（推荐）

#### 4.1 初始化 Git 仓库

```bash
git init
git add .
git commit -m "Initial commit"
```

#### 4.2 推送到 GitHub/GitLab

```bash
# 在 GitHub/GitLab 创建新仓库，然后：
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

#### 4.3 在 Cloudflare Dashboard 连接

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages** → **Pages**
3. 点击 **Create a project**
4. 选择 **Connect to Git**
5. 选择你的 Git 提供商（GitHub/GitLab）
6. 授权并选择仓库
7. 配置构建设置：
   - **Framework preset**: `Next.js (Static HTML Export)`
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Root directory**: `/`（项目根目录）
   - **Node version**: `18` 或更高
8. 环境变量：
   - 点击 **Add environment variable**
   - 名称：`NEXT_PUBLIC_API_URL`
   - 值：你的 Workers URL（如：`https://history-api.your-subdomain.workers.dev`）
9. 点击 **Save and Deploy**

### 方法二：直接上传（快速测试）

1. 在 Cloudflare Dashboard 中进入 **Workers & Pages** → **Pages**
2. 点击 **Create a project** → **Upload assets**
3. 上传整个 `out/` 目录的内容
4. 项目名称：`history-pro`（或任意名称）
5. 点击 **Deploy site**

---

## ✅ 第五步：验证部署

### 5.1 测试 Workers API

```bash
# 测试健康检查
curl https://your-worker-url.workers.dev/api/history?limit=1

# 应该返回空数组 [] 或现有数据
```

### 5.2 测试前端

访问你的 Cloudflare Pages URL（如：`https://your-project.pages.dev`）

应该能看到：
- 主页正常加载
- 可以访问上传页面
- 可以访问图床页面
- 可以访问 Markdown 指南

### 5.3 测试上传功能

1. 访问上传页面
2. 输入标题和内容
3. 输入上传密钥：`ssfz2027n15662768895`
4. 点击发布
5. 应该成功上传并返回首页

---

## 🔧 故障排除

### 问题 1: "Failed to fetch" 错误

**原因**：API 服务器未配置或无法连接

**解决**：
1. 检查 `NEXT_PUBLIC_API_URL` 环境变量是否正确
2. 确认 Workers 已成功部署
3. 测试 Workers URL 是否可访问：
   ```bash
   curl https://your-worker-url.workers.dev/api/history
   ```

### 问题 2: "Unauthorized" 错误

**原因**：密钥不匹配

**解决**：
1. 确认 `workers/wrangler.toml` 中的密钥正确
2. 重新部署 Workers：
   ```bash
   cd workers
   wrangler deploy
   ```

### 问题 3: KV 操作失败

**原因**：KV 命名空间未正确配置

**解决**：
1. 检查 `wrangler.toml` 中的 KV 命名空间 ID
2. 确认命名空间已创建
3. 重新部署 Workers

### 问题 4: 构建失败

**原因**：依赖未安装或配置错误

**解决**：
```bash
# 清理并重新安装
rm -rf node_modules .next out
npm install
npm run build
```

---

## 📝 部署检查清单

- [ ] Workers 已部署并运行
- [ ] KV 命名空间已创建并配置
- [ ] `wrangler.toml` 中的密钥已设置
- [ ] `.env.local` 中设置了 `NEXT_PUBLIC_API_URL`
- [ ] 前端构建成功（`out/` 目录存在）
- [ ] Cloudflare Pages 已部署
- [ ] 环境变量已在 Pages 中设置
- [ ] 可以访问网站
- [ ] 可以上传内容
- [ ] 可以查看内容

---

## 🎯 快速部署命令总结

```bash
# 1. 安装 Wrangler
npm install -g wrangler

# 2. 登录 Cloudflare
wrangler login

# 3. 创建 KV 命名空间（在 Dashboard 中操作，或使用 CLI）
wrangler kv:namespace create "HISTORY_KV"

# 4. 编辑 workers/wrangler.toml，填入 KV ID

# 5. 部署 Workers
cd workers
wrangler deploy

# 6. 创建 .env.local，设置 NEXT_PUBLIC_API_URL

# 7. 构建前端
cd ..
npm run build

# 8. 在 Cloudflare Dashboard 中部署 Pages
#    或使用 wrangler pages deploy out
```

---

## 💡 提示

1. **免费额度**：Cloudflare 免费计划提供：
   - 100,000 次 Workers 请求/天
   - 100,000 次 KV 读取/天
   - 100,000 次 KV 写入/天
   - 10 GB KV 存储
   - 无限 Pages 部署

2. **自定义域名**：可以在 Cloudflare Pages 设置中添加自定义域名

3. **环境变量**：生产环境的环境变量需要在 Cloudflare Dashboard 中设置

4. **监控**：可以在 Cloudflare Dashboard 中查看 Workers 和 Pages 的使用情况

---

## 📞 需要帮助？

如果遇到问题：
1. 检查 Cloudflare Dashboard 中的日志
2. 查看浏览器控制台的错误信息
3. 使用 `wrangler tail` 查看 Workers 实时日志

