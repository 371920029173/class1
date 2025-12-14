# 构建检查清单

## ✅ 已完成的配置

1. **密钥配置**
   - 上传密钥: ssfz2027n15662768895
   - 删除密钥: ssfz2027371920029173
   - 已更新到 workers/wrangler.toml

2. **标题更新**
   - 所有页面已更新为"一班史记"

3. **Cloudflare 兼容性**
   - compatibility_date: 2024-12-01
   - compatibility_flags: ["nodejs_compat"]

4. **代码检查**
   - ✅ 无 linter 错误
   - ✅ TypeScript 配置正确
   - ✅ 路径别名配置正确

## 🔧 构建命令

```bash
# 标准构建
npm run build

# 跳过 lint 检查（如果 lint 有问题）
npx next build --no-lint

# 查看详细输出
npm run build 2>&1 | tee build.log
```

## 📝 注意事项

1. **静态导出模式**: 项目使用 `output: 'export'`，所有页面都是静态的
2. **客户端组件**: 所有使用 hooks 的组件都已标记 `'use client'`
3. **动态导入**: RichTextEditor 使用动态导入避免 SSR 问题
4. **API 调用**: 所有 API 调用都在客户端进行，通过 apiClient

## 🚀 部署前检查

- [ ] 构建成功无错误
- [ ] 检查 out/ 目录是否生成
- [ ] 验证所有页面路由正常
- [ ] 确认环境变量已设置

## 🐛 常见构建错误

### 错误: Cannot find module
- 检查 node_modules 是否完整安装
- 运行 `npm install` 重新安装

### 错误: Module not found
- 检查路径别名 `@/*` 是否正确
- 确认 tsconfig.json 中的 paths 配置

### 错误: use client directive
- 确认所有使用 hooks 的组件都有 `'use client'` 指令



