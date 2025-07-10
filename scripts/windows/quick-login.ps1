# Quick Login Test - Simple one-liner commands for testing the login API
# Usage: .\quick-login.ps1

param(
    [string]$BaseUrl = "http://localhost:3031"
)

Write-Host "Quick Login Test" -ForegroundColor Green
Write-Host "=================" -ForegroundColor Green
Write-Host "Base URL: $BaseUrl" -ForegroundColor Cyan

Write-Host "`nAvailable Commands:" -ForegroundColor Yellow

Write-Host "`n1. Maria Esposito Login (Cashier):" -ForegroundColor Cyan
Write-Host "Invoke-WebRequest -Uri '$BaseUrl/api/auth/login' -Method POST -ContentType 'application/json' -Body '{\"email\":\"maria@bellavista.com\",\"password\":\"cashier123\",\"businessSlug\":\"bella-vista-italian\"}'" -ForegroundColor White

Write-Host "`n2. Giuseppe Romano Login (Cashier):" -ForegroundColor Cyan
Write-Host "Invoke-WebRequest -Uri '$BaseUrl/api/auth/login' -Method POST -ContentType 'application/json' -Body '{\"email\":\"giuseppe@bellavista.com\",\"password\":\"cashier123\",\"businessSlug\":\"bella-vista-italian\"}'" -ForegroundColor White

Write-Host "`n3. Login with BusinessId:" -ForegroundColor Cyan
Write-Host "Invoke-WebRequest -Uri '$BaseUrl/api/auth/login' -Method POST -ContentType 'application/json' -Body '{\"email\":\"maria@bellavista.com\",\"password\":\"cashier123\",\"businessId\":1}'" -ForegroundColor White

Write-Host "`n4. Invalid Credentials:" -ForegroundColor Cyan
Write-Host "Invoke-WebRequest -Uri '$BaseUrl/api/auth/login' -Method POST -ContentType 'application/json' -Body '{\"email\":\"maria@bellavista.com\",\"password\":\"wrongpassword\",\"businessSlug\":\"bella-vista-italian\"}'" -ForegroundColor White

Write-Host "`nCopy and paste any command above to test!" -ForegroundColor Yellow
Write-Host "   Make sure your server is running on $BaseUrl" -ForegroundColor Cyan 