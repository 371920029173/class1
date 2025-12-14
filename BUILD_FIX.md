# 构建失败修复指南

## 可能的原因和解决方案

### 1. Node 版本问题
- ✅ 已添加 `.nvmrc` 文件指定 Node 18
- 在 Cloudflare Pages 设置中确保 Node 版本为 18

### 2. 构建命令
- 确保使用：`npm run build`
- 不是：`npx next build`

### 3. 输出目录
- 确保填写：`out`
- 不是：`/out` 或 `/ out`

### 4. 环境变量
- 确保在 Cloudflare Pages 设置中添加：
  - 变量名：`NEXT_PUBLIC_API_URL`
  - 值：`https://history-api.40761154.workers.dev`

### 5. 依赖安装
如果构建失败，可能是依赖问题，尝试：
- 在 Cloudflare Pages 设置中添加构建命令：`npm ci && npm run build`
- 或者：`npm install && npm run build`

### 6. 检查构建日志
在 Cloudflare Dashboard 中查看构建日志，找到具体错误信息。

## 当前配置检查清单

- ✅ `next.config.js` - 已配置静态导出
- ✅ `package.json` - build 脚本正确
- ✅ `.nvmrc` - Node 18
- ✅ `cloudflare-pages.json` - 配置正确
- ✅ Workers KV ID - 已更新

## 如果仍然失败

1. 查看 Cloudflare Pages 构建日志
2. 检查是否有 TypeScript 错误
3. 确认所有依赖都已正确安装
4. 检查环境变量是否正确设置

