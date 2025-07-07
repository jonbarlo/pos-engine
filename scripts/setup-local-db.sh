#!/bin/bash

echo "🚀 Setting up local MS SQL Server database for POS Engine..."

# Check if sqlcmd is installed (MS SQL Server command line tool)
if ! command -v sqlcmd &> /dev/null; then
    echo "❌ MS SQL Server command line tools not found."
    echo "   Please install MS SQL Server or SQL Server Command Line Utilities:"
    echo "   macOS: brew install mssql-tools"
    echo "   Ubuntu: sudo apt-get install mssql-tools"
    echo "   Windows: Install SQL Server Management Studio or sqlcmd"
    echo ""
    echo "   Or use Docker:"
    echo "   docker run -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=YourStrong@Passw0rd' -p 1433:1433 -d mcr.microsoft.com/mssql/server:2019-latest"
    exit 1
fi

echo "📦 Checking MS SQL Server connection..."
echo "   Make sure MS SQL Server is running on localhost:1433"
echo ""

# Test connection
if sqlcmd -S localhost,1433 -U sa -P "YourStrong@Passw0rd" -Q "SELECT 1" &>/dev/null; then
    echo "✅ MS SQL Server connection successful!"
    
    # Create database
    echo "🗄️  Creating database 'pos_engine_dev'..."
    sqlcmd -S localhost,1433 -U sa -P "YourStrong@Passw0rd" -Q "CREATE DATABASE pos_engine_dev;" 2>/dev/null || {
        echo "⚠️  Could not create database. It might already exist."
    }
    
    echo "✅ Setup complete!"
    echo ""
    echo "📝 Next steps:"
    echo "   1. Update your .env file with local database settings:"
    echo "      DB_USERNAME=sa"
    echo "      DB_PASSWORD=YourStrong@Passw0rd"
    echo "      DB_NAME=pos_engine_dev"
    echo "      DB_HOST=localhost"
    echo "      DB_PORT=1433"
    echo ""
    echo "   2. Run: npm run migrate:all"
    echo "   3. Run: npm run dev"
    echo ""
else
    echo "❌ Could not connect to MS SQL Server."
    echo ""
    echo "🔧 Setup options:"
    echo "   1. Install MS SQL Server locally"
    echo "   2. Use Docker: docker run -e 'ACCEPT_EULA=Y' -e 'SA_PASSWORD=YourStrong@Passw0rd' -p 1433:1433 -d mcr.microsoft.com/mssql/server:2019-latest"
    echo "   3. Use your remote MS SQL Server (update .env with correct credentials)"
    echo ""
    echo "📝 For remote server, update your .env file:"
    echo "   DB_USERNAME=pos_admin_db"
    echo "   DB_PASSWORD=Yyhh8hfB8D8k*sx$"
    echo "   DB_NAME=5506_software_mssql_pos_engine_dev"
    echo "   DB_HOST=mssql001.use1.my-hosting-panel.com"
    echo "   DB_PORT=1433"
    echo ""
fi 