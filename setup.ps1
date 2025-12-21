# History Pro 安装脚本
# 配置npm将缓存和全局包安装到C盘

Write-Host "正在配置npm使用C盘..." -ForegroundColor Green

# 创建C盘目录
$cacheDir = "C:\npm-cache"
$globalDir = "C:\npm-global"

if (-not (Test-Path $cacheDir)) {
    New-Item -ItemType Directory -Path $cacheDir -Force | Out-Null
    Write-Host "已创建缓存目录: $cacheDir" -ForegroundColor Yellow
}

if (-not (Test-Path $globalDir)) {
    New-Item -ItemType Directory -Path $globalDir -Force | Out-Null
    Write-Host "已创建全局目录: $globalDir" -ForegroundColor Yellow
}

# 配置npm
npm config set cache "$cacheDir" --global
npm config set prefix "$globalDir" --global

Write-Host "npm配置完成!" -ForegroundColor Green
Write-Host "缓存目录: $cacheDir" -ForegroundColor Cyan
Write-Host "全局目录: $globalDir" -ForegroundColor Cyan

# 安装依赖
Write-Host "`n正在安装依赖..." -ForegroundColor Green
npm install

Write-Host "`n安装完成! 运行 'npm run dev' 启动开发服务器" -ForegroundColor Green






