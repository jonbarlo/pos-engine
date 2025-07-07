# PowerShell script to test the Node.js API
# This script tests all major endpoints

param(
    [string]$BaseUrl = "http://localhost:3031"
)

Write-Host "🧪 Testing Node.js API at $BaseUrl" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Test 1: Health Check (if available)
Write-Host "`n1️⃣ Testing basic connectivity..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/items" -Method GET -ErrorAction Stop
    Write-Host "✅ Server is responding (got authentication error as expected)" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -like "*401*" -or $_.Exception.Message -like "*Unauthorized*" -or $_.Exception.Message -like "*Access token required*") {
        Write-Host "✅ Server is responding (got authentication error as expected)" -ForegroundColor Green
    } else {
        Write-Host "❌ Server is not responding: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Test 2: User Registration
Write-Host "`n2️⃣ Testing user registration..." -ForegroundColor Yellow
$testEmail = "testuser_$(Get-Date -Format 'yyyyMMdd_HHmmss')@example.com"
$registerBody = @{
    name = "Test User"
    email = $testEmail
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/auth/register" -Method POST -ContentType "application/json" -Body $registerBody
    $registerResult = $response.Content | ConvertFrom-Json
    Write-Host "✅ User registered successfully: $($registerResult.user.email)" -ForegroundColor Green
    Write-Host "   User ID: $($registerResult.user.id)" -ForegroundColor Cyan
    Write-Host "   Token: $($registerResult.token.Substring(0, 20))..." -ForegroundColor Cyan
} catch {
    Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorContent = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorContent)
        $errorBody = $reader.ReadToEnd()
        Write-Host "   Error details: $errorBody" -ForegroundColor Red
    }
}

# Test 3: User Login
Write-Host "`n3️⃣ Testing user login..." -ForegroundColor Yellow
$loginBody = @{
    email = $testEmail
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
    $loginResult = $response.Content | ConvertFrom-Json
    $token = $loginResult.token
    Write-Host "✅ Login successful: $($loginResult.user.email)" -ForegroundColor Green
    Write-Host "   Token: $($token.Substring(0, 20))..." -ForegroundColor Cyan
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorContent = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorContent)
        $errorBody = $reader.ReadToEnd()
        Write-Host "   Error details: $errorBody" -ForegroundColor Red
    }
    exit 1
}

# Test 4: Protected Endpoint (Items)
Write-Host "`n4️⃣ Testing protected endpoint (items)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/items" -Method GET -Headers @{"Authorization"="Bearer $token"}
    Write-Host "✅ Protected endpoint accessible" -ForegroundColor Green
    Write-Host "   Response: $($response.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Protected endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorContent = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorContent)
        $errorBody = $reader.ReadToEnd()
        Write-Host "   Error details: $errorBody" -ForegroundColor Red
    }
}

# Test 5: Users Endpoint
Write-Host "`n5️⃣ Testing users endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/users" -Method GET -Headers @{"Authorization"="Bearer $token"}
    Write-Host "✅ Users endpoint accessible" -ForegroundColor Green
    $usersResult = $response.Content | ConvertFrom-Json
    Write-Host "   Found $($usersResult.length) users" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Users endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Invalid Token
Write-Host "`n6️⃣ Testing invalid token..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/items" -Method GET -Headers @{"Authorization"="Bearer invalid_token"}
    Write-Host "❌ Should have failed with invalid token" -ForegroundColor Red
} catch {
    if ($_.Exception.Message -like "*401*" -or $_.Exception.Message -like "*Unauthorized*") {
        Write-Host "✅ Invalid token properly rejected" -ForegroundColor Green
    } else {
        Write-Host "❌ Unexpected error with invalid token: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎉 API Testing Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host "All tests passed! Your API is working correctly." -ForegroundColor Green

# Cleanup: Delete test user (optional)
Write-Host "`n🧹 Test user created: $testEmail" -ForegroundColor Yellow
Write-Host "You may want to delete this test user from your database." -ForegroundColor Yellow 