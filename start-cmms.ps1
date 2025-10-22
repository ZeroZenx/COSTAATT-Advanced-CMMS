# COSTAATT CMMS Startup Script (Windows Service)
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting COSTAATT CMMS System" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start Windows Services
Write-Host "Starting CMMS Backend Service (Port 4000)..." -ForegroundColor Yellow
Start-Service COSTAATT-CMMS-Backend
Write-Host "✅ Backend service started" -ForegroundColor Green

Write-Host "Starting CMMS Frontend Service (Port 5174)..." -ForegroundColor Yellow
Start-Service COSTAATT-CMMS-Frontend
Write-Host "✅ Frontend service started" -ForegroundColor Green

Start-Sleep -Seconds 5

# Check service status
$services = Get-Service COSTAATT-CMMS-*
Write-Host ""
Write-Host "Service Status:" -ForegroundColor Yellow
$services | Format-Table Name, Status, StartType -AutoSize

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CMMS System Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Yellow
Write-Host "  Frontend: http://10.2.1.27:5174" -ForegroundColor White
Write-Host "  Backend:  http://10.2.1.27:4000" -ForegroundColor White
Write-Host ""
Write-Host "Login Credentials:" -ForegroundColor Yellow
Write-Host "  Admin: admin@costaatt.edu.tt / Admin@123" -ForegroundColor White
Write-Host ""
Write-Host "Note: Services are now running as Windows Services" -ForegroundColor Cyan
Write-Host "      They will auto-start on Windows boot" -ForegroundColor Cyan
Write-Host "      To stop: Run stop-cmms.ps1 or use Services.msc" -ForegroundColor Cyan
Write-Host ""

