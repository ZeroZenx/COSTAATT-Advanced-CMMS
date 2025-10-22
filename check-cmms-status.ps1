# COSTAATT CMMS Status Check Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "COSTAATT CMMS System Status" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check Windows Services
Write-Host "Windows Services Status:" -ForegroundColor Yellow
$services = Get-Service COSTAATT-CMMS-*
$services | Format-Table Name, DisplayName, Status, StartType -AutoSize

# Check Ports
Write-Host ""
Write-Host "Port Status:" -ForegroundColor Yellow
$port4000 = Get-NetTCPConnection -LocalPort 4000 -State Listen -ErrorAction SilentlyContinue
$port5174 = Get-NetTCPConnection -LocalPort 5174 -State Listen -ErrorAction SilentlyContinue

if ($port4000) {
    Write-Host "  ✅ Backend (Port 4000): LISTENING" -ForegroundColor Green
} else {
    Write-Host "  ❌ Backend (Port 4000): NOT LISTENING" -ForegroundColor Red
}

if ($port5174) {
    Write-Host "  ✅ Frontend (Port 5174): LISTENING" -ForegroundColor Green
} else {
    Write-Host "  ❌ Frontend (Port 5174): NOT LISTENING" -ForegroundColor Red
}

# Test HTTP Accessibility
Write-Host ""
Write-Host "HTTP Accessibility:" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri http://localhost:5174/ -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "  ✅ Frontend HTTP: Accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Frontend HTTP: Not accessible" -ForegroundColor Red
}

try {
    Invoke-WebRequest -Uri http://localhost:4000/ -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop | Out-Null
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "  ✅ Backend HTTP: Responding (404 expected for root route)" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Backend HTTP: Not accessible" -ForegroundColor Red
    }
}

# Check Logs
Write-Host ""
Write-Host "Recent Log Files:" -ForegroundColor Yellow
$logFiles = Get-ChildItem "C:\COSTAATT-CMMS\logs\service-*.log" -ErrorAction SilentlyContinue | 
    Select-Object Name, @{Name="Size";Expression={"{0:N2} KB" -f ($_.Length / 1KB)}}, LastWriteTime |
    Sort-Object LastWriteTime -Descending

if ($logFiles) {
    $logFiles | Format-Table -AutoSize
} else {
    Write-Host "  No log files found" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Status Check Complete" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access URLs:" -ForegroundColor Yellow
Write-Host "  Frontend: http://10.2.1.27:5174" -ForegroundColor White
Write-Host "  Backend:  http://10.2.1.27:4000" -ForegroundColor White
Write-Host ""

