# PowerShell script to set up environment variables for IIS Application Pool
# Run this script as Administrator

param(
    [string]$AppPoolName = "DefaultAppPool",
    [string]$SiteName = "node-js-api.506software.com"
)

Write-Host "Setting up environment variables for IIS Application Pool: $AppPoolName" -ForegroundColor Green

# Environment variables to set
$envVars = @{
    "NODE_ENV" = "production"
    "DB_HOST" = "mssql001.use1.my-hosting-panel.com"
    "DB_NAME" = "506software-mssqlserverdb-test"
    "DB_USERNAME" = "defaultUser"
    "DB_PASSWORD" = "tpp0Yk%JI4qybl^9"
    "DB_PORT" = "1433"
    "APP_NAME" = "MyNodeAPI"
    "VERSION" = "1.0.0"
    "JWT_SECRET" = "27da9a61247c72ed99fced796b7da69da795de08"
}

# Import IIS Administration module
Import-Module IISAdministration

try {
    # Get the application pool
    $appPool = Get-IISAppPool -Name $AppPoolName
    
    if ($appPool) {
        Write-Host "Found Application Pool: $AppPoolName" -ForegroundColor Yellow
        
        # Set environment variables for the application pool
        foreach ($key in $envVars.Keys) {
            $value = $envVars[$key]
            Write-Host "Setting $key = $value" -ForegroundColor Cyan
            
            # Set environment variable for the application pool
            Set-ItemProperty -Path "IIS:\AppPools\$AppPoolName" -Name "EnvironmentVariables" -Value @{$key = $value}
        }
        
        Write-Host "Environment variables set successfully!" -ForegroundColor Green
        Write-Host "Please restart the Application Pool to apply changes." -ForegroundColor Yellow
        
        # Restart the application pool
        Write-Host "Restarting Application Pool..." -ForegroundColor Yellow
        Restart-WebAppPool -Name $AppPoolName
        
        Write-Host "Application Pool restarted successfully!" -ForegroundColor Green
        
    } else {
        Write-Host "Application Pool '$AppPoolName' not found!" -ForegroundColor Red
        Write-Host "Available Application Pools:" -ForegroundColor Yellow
        Get-IISAppPool | Select-Object Name
    }
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure you're running this script as Administrator" -ForegroundColor Yellow
}

Write-Host "`nAlternative method - Manual steps:" -ForegroundColor Yellow
Write-Host "1. Open IIS Manager" -ForegroundColor White
Write-Host "2. Go to Application Pools" -ForegroundColor White
Write-Host "3. Right-click on your Application Pool and select 'Advanced Settings'" -ForegroundColor White
Write-Host "4. Find 'Environment Variables' and click '...'" -ForegroundColor White
Write-Host "5. Add each environment variable manually" -ForegroundColor White
Write-Host "6. Restart the Application Pool" -ForegroundColor White 