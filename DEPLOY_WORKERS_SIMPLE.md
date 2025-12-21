# 快速部署 Workers API

## 步骤 1: 安装 Wrangler

```powershell
npm install -g wrangler
```

## 步骤 2: 登录 Cloudflare

```powershell
wrangler login
```

会打开浏览器，登录你的 Cloudflare 账号。

## 步骤 3: 创建 KV 命名空间

在 Cloudflare Dashboard 中：
1. 进入 **Workers & Pages** → **KV**
2. 点击 **Create a namespace**
3. 名称：`history-kv`
4. 点击 **Add**
5. **复制 Namespace ID**（类似：`abc123def456...`）

## 步骤 4: 更新 wrangler.toml

编辑 `workers/wrangler.toml`，将第 9 行的：
```toml
id = "your-kv-namespace-id"
```
替换为你刚才复制的 ID。

## 步骤 5: 部署 Workers

```powershell
cd workers
wrangler deploy
```

部署成功后会显示 URL，例如：
```
https://history-api.xxxxx.workers.dev
```

**这个 URL 就是你的 Workers URL！**

## 步骤 6: 配置 Pages 环境变量

回到 Cloudflare Pages 设置：
- 变量名称：`NEXT_PUBLIC_API_URL`
- Variable value：你刚才获得的 Workers URL





