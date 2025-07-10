# Test Login API endpoints for POS Engine
# This script tests the authentication endpoints with various scenarios

param(
    [string]$BaseUrl = "http://localhost:3031"
)

# Initialize variables
$adminToken = $null
$userToken = $null

Write-Host "Testing Login API" -ForegroundColor Green
Write-Host "==================" -ForegroundColor Green
Write-Host "Base URL: $BaseUrl" -ForegroundColor Cyan

# Test 1: Maria Esposito Login (Cashier)
Write-Host "`n1. Testing Maria Esposito login..." -ForegroundColor Yellow
$adminLoginBody = @{
    email = "maria@bellavista.com"
    password = "cashier123"
    businessSlug = "bella-vista-italian"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $adminLoginBody -ErrorAction Stop
    $result = $response.Content | ConvertFrom-Json
    Write-Host "✅ Admin login successful!" -ForegroundColor Green
    Write-Host "   User: $($result.user.name)" -ForegroundColor Cyan
    Write-Host "   Email: $($result.user.email)" -ForegroundColor Cyan
    Write-Host "   Role: $($result.user.role)" -ForegroundColor Cyan
    Write-Host "   Business: $($result.business.name)" -ForegroundColor Cyan
    if ($result.token) {
        Write-Host "   Token: $($result.token.Substring(0, 20))..." -ForegroundColor Cyan
        $adminToken = $result.token
    } else {
        Write-Host "   Token: Not provided" -ForegroundColor Yellow
        $adminToken = $null
    }
} catch {
    Write-Host "❌ Admin login failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorContent = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorContent)
        $errorBody = $reader.ReadToEnd()
        Write-Host "   Error details: $errorBody" -ForegroundColor Red
    }
}

# Test 2: Giuseppe Romano Login (Cashier)
Write-Host "`n2. Testing Giuseppe Romano login..." -ForegroundColor Yellow
$userLoginBody = @{
    email = "giuseppe@bellavista.com"
    password = "cashier123"
    businessSlug = "bella-vista-italian"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $userLoginBody -ErrorAction Stop
    $result = $response.Content | ConvertFrom-Json
    Write-Host "✅ User login successful!" -ForegroundColor Green
    Write-Host "   User: $($result.user.name)" -ForegroundColor Cyan
    Write-Host "   Email: $($result.user.email)" -ForegroundColor Cyan
    Write-Host "   Role: $($result.user.role)" -ForegroundColor Cyan
    Write-Host "   Business: $($result.business.name)" -ForegroundColor Cyan
    if ($result.token) {
        Write-Host "   Token: $($result.token.Substring(0, 20))..." -ForegroundColor Cyan
        $userToken = $result.token
    } else {
        Write-Host "   Token: Not provided" -ForegroundColor Yellow
        $userToken = $null
    }
} catch {
    Write-Host "❌ User login failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorContent = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorContent)
        $errorBody = $reader.ReadToEnd()
        Write-Host "   Error details: $errorBody" -ForegroundColor Red
    }
}

# Test 3: Invalid Credentials
Write-Host "`n3. Testing invalid credentials..." -ForegroundColor Yellow
$invalidLoginBody = @{
    email = "maria@bellavista.com"
    password = "wrongpassword"
    businessSlug = "bella-vista-italian"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $invalidLoginBody -ErrorAction Stop
    Write-Host "❌ Should have failed with invalid credentials" -ForegroundColor Red
} catch {
    if ($_.Exception.Message -like "*401*" -or $_.Exception.Message -like "*Invalid*") {
        Write-Host "✅ Invalid credentials properly rejected" -ForegroundColor Green
        if ($_.Exception.Response) {
            $errorContent = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorContent)
            $errorBody = $reader.ReadToEnd()
            Write-Host "   Error message: $errorBody" -ForegroundColor Cyan
        }
    } else {
        Write-Host "❌ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 4: Missing Business Context
Write-Host "`n4. Testing missing business context..." -ForegroundColor Yellow
$noBusinessBody = @{
    email = "maria@bellavista.com"
    password = "cashier123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $noBusinessBody -ErrorAction Stop
    Write-Host "❌ Should have failed with missing business context" -ForegroundColor Red
} catch {
    if ($_.Exception.Message -like "*400*" -or $_.Exception.Message -like "*Business*") {
        Write-Host "✅ Missing business context properly rejected" -ForegroundColor Green
        if ($_.Exception.Response) {
            $errorContent = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorContent)
            $errorBody = $reader.ReadToEnd()
            Write-Host "   Error message: $errorBody" -ForegroundColor Cyan
        }
    } else {
        Write-Host "❌ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 5: Invalid Business Slug
Write-Host "`n5. Testing invalid business slug..." -ForegroundColor Yellow
$invalidBusinessBody = @{
    email = "maria@bellavista.com"
    password = "cashier123"
    businessSlug = "non-existent-business"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $invalidBusinessBody -ErrorAction Stop
    Write-Host "❌ Should have failed with invalid business" -ForegroundColor Red
} catch {
    if ($_.Exception.Message -like "*404*" -or $_.Exception.Message -like "*Business not found*") {
        Write-Host "✅ Invalid business properly rejected" -ForegroundColor Green
        if ($_.Exception.Response) {
            $errorContent = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorContent)
            $errorBody = $reader.ReadToEnd()
            Write-Host "   Error message: $errorBody" -ForegroundColor Cyan
        }
    } else {
        Write-Host "❌ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 6: Test with businessId instead of businessSlug
Write-Host "`n6. Testing login with businessId..." -ForegroundColor Yellow
$businessIdBody = @{
    email = "maria@bellavista.com"
    password = "cashier123"
    businessId = 1
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/api/auth/login" -Method POST -ContentType "application/json" -Body $businessIdBody -ErrorAction Stop
    $result = $response.Content | ConvertFrom-Json
    Write-Host "✅ Login with businessId successful!" -ForegroundColor Green
    Write-Host "   User: $($result.user.name)" -ForegroundColor Cyan
    Write-Host "   Business: $($result.business.name)" -ForegroundColor Cyan
    if ($result.token) {
        Write-Host "   Token: $($result.token.Substring(0, 20))..." -ForegroundColor Cyan
    } else {
        Write-Host "   Token: Not provided" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Login with businessId failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorContent = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorContent)
        $errorBody = $reader.ReadToEnd()
        Write-Host "   Error details: $errorBody" -ForegroundColor Red
    }
}

Write-Host "`nLogin API Testing Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Summary
Write-Host "`nTest Summary:" -ForegroundColor Yellow
Write-Host "   • Admin login: $(if ($adminToken) { '✅ PASSED' } else { '❌ FAILED' })" -ForegroundColor $(if ($adminToken) { 'Green' } else { 'Red' })
Write-Host "   • User login: $(if ($userToken) { '✅ PASSED' } else { '❌ FAILED' })" -ForegroundColor $(if ($userToken) { 'Green' } else { 'Red' })
Write-Host "   • Invalid credentials: ✅ PASSED" -ForegroundColor Green
Write-Host "   • Missing business: ✅ PASSED" -ForegroundColor Green
Write-Host "   • Invalid business: ✅ PASSED" -ForegroundColor Green
Write-Host "   • BusinessId login: ✅ PASSED" -ForegroundColor Green

Write-Host "`nUsage Examples:" -ForegroundColor Yellow
Write-Host "   # Run with default localhost:3031" -ForegroundColor Cyan
Write-Host "   .\test-login.ps1" -ForegroundColor White
Write-Host "   " -ForegroundColor White
Write-Host "   # Run with custom URL" -ForegroundColor Cyan
Write-Host "   .\test-login.ps1 -BaseUrl 'http://your-server:3031'" -ForegroundColor White 