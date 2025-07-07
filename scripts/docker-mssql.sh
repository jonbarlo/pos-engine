#!/bin/bash

echo "🐳 Setting up MS SQL Server with Docker for POS Engine..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first:"
    echo "   macOS: https://docs.docker.com/desktop/install/mac-install/"
    echo "   Ubuntu: https://docs.docker.com/engine/install/ubuntu/"
    echo "   Windows: https://docs.docker.com/desktop/install/windows-install/"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running. Please start Docker Desktop."
    exit 1
fi

# Stop existing container if running
echo "🛑 Stopping existing MS SQL Server container..."
docker stop pos-engine-mssql 2>/dev/null || echo "No existing container to stop"

# Remove existing container
docker rm pos-engine-mssql 2>/dev/null || echo "No existing container to remove"

# Start new MS SQL Server container
echo "🚀 Starting MS SQL Server container..."
docker run -d \
  --name pos-engine-mssql \
  -e 'ACCEPT_EULA=Y' \
  -e 'SA_PASSWORD=YourStrong@Passw0rd' \
  -e 'MSSQL_PID=Developer' \
  -p 1433:1433 \
  mcr.microsoft.com/mssql/server:2019-latest

# Wait for container to be ready
echo "⏳ Waiting for MS SQL Server to start..."
sleep 10

# Test connection
echo "🔍 Testing connection..."
if docker exec pos-engine-mssql /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -Q "SELECT 1" &>/dev/null; then
    echo "✅ MS SQL Server is running successfully!"
    
    # Create database
    echo "🗄️  Creating database 'pos_engine_dev'..."
    docker exec pos-engine-mssql /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong@Passw0rd" -Q "CREATE DATABASE pos_engine_dev;" 2>/dev/null || {
        echo "⚠️  Database might already exist."
    }
    
    echo ""
    echo "🎉 Setup complete! Your MS SQL Server is ready."
    echo ""
    echo "📝 Database connection details:"
    echo "   Host: localhost"
    echo "   Port: 1433"
    echo "   Username: sa"
    echo "   Password: YourStrong@Passw0rd"
    echo "   Database: pos_engine_dev"
    echo ""
    echo "📝 Update your .env file with:"
    echo "   DB_USERNAME=sa"
    echo "   DB_PASSWORD=YourStrong@Passw0rd"
    echo "   DB_NAME=pos_engine_dev"
    echo "   DB_HOST=localhost"
    echo "   DB_PORT=1433"
    echo ""
    echo "🚀 Next steps:"
    echo "   1. Update your .env file with the settings above"
    echo "   2. Run: npm run migrate:all"
    echo "   3. Run: npm run dev"
    echo ""
    echo "🛑 To stop the database: ./scripts/docker-mssql.sh stop"
    echo "🔄 To restart: ./scripts/docker-mssql.sh restart"
else
    echo "❌ Failed to connect to MS SQL Server. Container might still be starting..."
    echo "   Try running this script again in a few seconds."
fi 