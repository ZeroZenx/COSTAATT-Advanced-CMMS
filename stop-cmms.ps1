# COSTAATT CMMS Stop Script (Windows Service)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Stopping COSTAATT CMMS System" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Stop Windows Services
Write-Host "Stopping CMMS Backend Service..." -ForegroundColor Yellow
Stop-Service COSTAATT-CMMS-Backend -Force
Write-Host "✅ Backend service stopped" -ForegroundColor Green

Write-Host "Stopping CMMS Frontend Service..." -ForegroundColor Yellow
Stop-Service COSTAATT-CMMS-Frontend -Force
Write-Host "✅ Frontend service stopped" -ForegroundColor Green

Start-Sleep -Seconds 2

# Check service status
$services = Get-Service COSTAATT-CMMS-*
Write-Host ""
Write-Host "Service Status:" -ForegroundColor Yellow
$services | Format-Table Name, Status, StartType -AutoSize

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CMMS System Stopped" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: Services are configured for automatic startup" -ForegroundColor Cyan
Write-Host "      They will restart on next Windows boot" -ForegroundColor Cyan
Write-Host ""

