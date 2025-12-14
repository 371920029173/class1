# 配置说明

## 已配置的密钥

- **上传密钥**: `ssfz2027n15662768895`
- **删除密钥**: `ssfz2027371920029173`

## 应用标题

- **标题**: 一班史记

## Cloudflare Workers 配置

### wrangler.toml

已更新为最新兼容性配置：

```toml
compatibility_date = "2024-12-01"
compatibility_flags = ["nodejs_compat"]
```

### 环境变量

在 Cloudflare Dashboard 中设置：

- `UPLOAD_KEY`: ssfz2027n15662768895
- `DELETE_KEY`: ssfz2027371920029173

## 前端配置

### 环境变量 (.env.local)

```env
NEXT_PUBLIC_API_URL=https://your-worker.your-subdomain.workers.dev
```

## 构建说明

项目使用静态导出模式，完全兼容 Cloudflare Pages：

- 无需 edge runtime（静态导出不支持）
- 所有数据通过客户端 API 调用 Workers
- 支持本地存储和服务器同步双模式

## 部署步骤

1. **部署 Workers**:
   ```bash
   cd workers
   wrangler deploy
   ```

2. **配置前端环境变量**:
   创建 `.env.local` 并设置 `NEXT_PUBLIC_API_URL`

3. **构建前端**:
   ```bash
   npm run build
   ```

4. **部署到 Cloudflare Pages**:
   - 输出目录: `out`
   - 构建命令: `npm run build`


