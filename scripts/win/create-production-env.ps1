# PowerShell script to create production .env file
# This script creates a .env file with production environment variables

$envContent = @"
# Production Environment Variables
NODE_ENV=production
DB_HOST=mssql001.use1.my-hosting-panel.com
DB_NAME=506software-mssqlserverdb-test
DB_USERNAME=defaultUser
DB_PASSWORD=tpp0Yk%JI4qybl^9
DB_PORT=1433
APP_NAME=MyNodeAPI
VERSION=1.0.0
JWT_SECRET=27da9a61247c72ed99fced796b7da69da795de08
"@

# Create the .env file in the dist directory
$envPath = "dist\.env"
$envContent | Out-File -FilePath $envPath -Encoding UTF8 -NoNewline

Write-Host "Production .env file created at: $envPath" -ForegroundColor Green
Write-Host "Make sure to upload this file to your production server" -ForegroundColor Yellow 