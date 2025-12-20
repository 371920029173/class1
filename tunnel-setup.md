# Cloudflare Tunnel 配置指南

## 方案说明

由于 `*.workers.dev` 在中国大陆可能被拦截，我们使用 Cloudflare Tunnel 创建一个可访问的 API 端点。

## 方案选择

### 方案 1：使用 Cloudflare 自定义域名（推荐，最简单）

如果你有自己的域名（或可以购买一个），直接在 Cloudflare 上为 Worker 绑定自定义域名：

1. 登录 Cloudflare Dashboard
2. 进入 Workers & Pages → 找到 `history-api` Worker
3. 点击 "Triggers" → "Custom Domains"
4. 添加自定义域名，例如：`api.yourdomain.com`
5. 在 Pages 环境变量中设置：`NEXT_PUBLIC_API_URL=https://api.yourdomain.com`

**优点**：最简单，不需要额外服务
**缺点**：需要有自己的域名

### 方案 2：使用 Cloudflare Tunnel（适合没有域名的情况）

使用 Cloudflare Tunnel 创建一个可访问的端点。

## Cloudflare Tunnel 部署步骤

### 1. 安装 cloudflared

**Windows:**
```powershell
# 下载 cloudflared
Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" -OutFile "cloudflared.exe"
```

**或者使用包管理器:**
```powershell
# 使用 Chocolatey
choco install cloudflared

# 或使用 Scoop
scoop install cloudflared
```

### 2. 登录 Cloudflare

```powershell
cloudflared tunnel login
```

这会打开浏览器，选择你的 Cloudflare 账户和域名。

### 3. 创建 Tunnel

```powershell
cloudflared tunnel create history-api-tunnel
```

这会创建一个 Tunnel 并返回 Tunnel ID。

### 4. 配置 Tunnel

编辑 `cloudflared/config.yml`（需要根据你的 Tunnel ID 修改）：

```yaml
tunnel: <你的TUNNEL_ID>
credentials-file: C:\path\to\credentials.json

ingress:
  - hostname: api-tunnel.yourdomain.com
    service: https://history-api-production.40761154.workers.dev
  - service: http_status:404
```

### 5. 创建 DNS 记录

在 Cloudflare Dashboard 中为你的域名创建 CNAME 记录：
- 名称：`api-tunnel`（或你想要的子域名）
- 目标：`<TUNNEL_ID>.cfargotunnel.com`
- 代理状态：已代理（橙色云朵）

### 6. 运行 Tunnel

```powershell
cloudflared tunnel run history-api-tunnel
```

### 7. 配置为服务（可选，让 Tunnel 在后台运行）

**Windows (使用 NSSM):**
```powershell
# 下载 NSSM
# 安装服务
nssm install CloudflareTunnel "C:\path\to\cloudflared.exe" tunnel run history-api-tunnel
nssm start CloudflareTunnel
```

## 方案 3：使用 Pages Functions 作为反向代理（推荐，无需额外服务）

将 API 逻辑迁移到 Pages Functions，这样前端和 API 都在同一个域名下，不会被拦截。

### 步骤：

1. 在 `app/api/` 目录下创建 API 路由
2. 这些路由会作为 Pages Functions 运行
3. 在 Functions 中调用 Workers API（作为后端）
4. 前端直接调用 `/api/...`（同域名）

**优点**：
- 不需要额外服务
- 前端和 API 同域名，不会被拦截
- 部署简单

**缺点**：
- 需要将 Workers 逻辑复制到 Pages Functions
- 或者 Functions 作为代理转发到 Workers

## 推荐方案

**我建议使用方案 3（Pages Functions 反向代理）**，因为：
1. 不需要额外服务或域名
2. 前端和 API 同域名，完全避免拦截问题
3. 部署简单，只需修改代码

让我为你实现方案 3。

