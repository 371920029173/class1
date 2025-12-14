# Cloudflare Workers 部署指南

## 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

或者使用 npx（推荐）：

```bash
npx wrangler --version
```

## 2. 登录 Cloudflare

```bash
wrangler login
```

这会打开浏览器，登录你的 Cloudflare 账号。

## 3. 创建 KV 命名空间

### 方法一：使用 Dashboard

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 进入 **Workers & Pages** → **KV**
3. 点击 **Create a namespace**
4. 输入名称，例如：`history-pro-kv`
5. 记录生成的 **Namespace ID**

### 方法二：使用 CLI

```bash
wrangler kv:namespace create "HISTORY_KV"
```

这会输出 Namespace ID，复制它。

## 4. 配置 wrangler.toml

编辑 `workers/wrangler.toml`：

```toml
name = "history-api"
main = "api/index.ts"
compatibility_date = "2024-01-01"

[[kv_namespaces]]
binding = "HISTORY_KV"
id = "你的-KV-命名空间-ID"  # 替换这里

[env.production.vars]
UPLOAD_KEY = "生成一个强随机字符串作为上传密钥"
DELETE_KEY = "生成一个强随机字符串作为删除密钥"
```

### 生成密钥

可以使用以下方法生成强随机密钥：

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

## 5. 部署 Workers

```bash
cd workers
wrangler deploy
```

部署成功后，会显示 Workers URL，例如：
```
https://history-api.your-subdomain.workers.dev
```

## 6. 配置前端

在项目根目录创建 `.env.local`：

```env
NEXT_PUBLIC_API_URL=https://history-api.your-subdomain.workers.dev
```

## 7. 测试 API

### 测试健康检查

```bash
curl https://your-worker-url.workers.dev/api/history?limit=1
```

应该返回空数组 `[]`（如果还没有数据）。

### 测试上传（需要密钥）

```bash
curl -X POST https://your-worker-url.workers.dev/api/history \
  -H "Content-Type: application/json" \
  -H "X-Upload-Key: 你的上传密钥" \
  -d '{
    "title": "测试记录",
    "description": "这是一条测试记录",
    "timestamp": 1704067200000
  }'
```

## 8. 管理密钥

### 查看密钥

在 Cloudflare Dashboard → Workers & Pages → 你的 Worker → Settings → Variables

### 更新密钥

编辑 `wrangler.toml` 中的密钥，然后重新部署：

```bash
wrangler deploy
```

## 9. 监控和日志

### 查看实时日志

```bash
wrangler tail
```

### 在 Dashboard 查看

进入 Workers & Pages → 你的 Worker → Logs

## 10. 成本说明

- **免费额度**：
  - 100,000 次请求/天
  - 100,000 次 KV 读取/天
  - 100,000 次 KV 写入/天
  - 10 GB 存储

对于个人项目，免费额度通常足够使用。

## 故障排除

### 部署失败

1. 检查 `wrangler.toml` 配置是否正确
2. 确认 KV 命名空间 ID 正确
3. 检查是否已登录：`wrangler whoami`

### API 返回 401

1. 检查请求头中的密钥是否正确
2. 确认 `wrangler.toml` 中的密钥已正确设置
3. 重新部署 Workers

### KV 操作失败

1. 确认 KV 命名空间已创建
2. 检查 `wrangler.toml` 中的绑定名称和 ID
3. 确认命名空间已关联到 Worker



