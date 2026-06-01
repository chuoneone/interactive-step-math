# UTF-8 signature to display Chinese properly in PowerShell window
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "       SPEDMIX 程式代碼同步工具          " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "正在從 GitHub 同步最新修改 (git pull)..." -ForegroundColor Yellow

# Perform git pull
git pull origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "-----------------------------------------" -ForegroundColor Green
    Write-Host "✔ 同步成功！您的代碼已是最新版本。" -ForegroundColor Green
    Write-Host "-----------------------------------------" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "-----------------------------------------" -ForegroundColor Red
    Write-Host "❌ 同步失敗！請檢查：" -ForegroundColor Red
    Write-Host "1. 您的網路連線是否正常" -ForegroundColor Red
    Write-Host "2. 本地是否有尚未提交的修改衝突" -ForegroundColor Red
    Write-Host "-----------------------------------------" -ForegroundColor Red
}

Write-Host ""
Read-Host "按 Enter 鍵關閉此視窗..."
