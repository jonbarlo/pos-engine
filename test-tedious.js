const { Connection, Request } = require('tedious');

// Test multiple configurations
const configs = [
  {
    name: 'Config 1 - No Encrypt',
    server: 'mssql001.use1.my-hosting-panel.com',
    authentication: {
      type: 'default',
      options: {
        userName: 'pos_admin_db',
        password: 'X7831mk3J5f',
      },
    },
    options: {
      database: '506_software_mssql_pos_engine_dev',
      encrypt: false,
      trustServerCertificate: true,
      port: 1433,
      rowCollectionOnRequestCompletion: true,
      connectTimeout: 30000,
      requestTimeout: 30000,
      enableArithAbort: true,
    },
  },
  {
    name: 'Config 2 - With Encrypt',
    server: 'mssql001.use1.my-hosting-panel.com',
    authentication: {
      type: 'default',
      options: {
        userName: 'pos_admin_db',
        password: 'X7831mk3J5f',
      },
    },
    options: {
      database: '506_software_mssql_pos_engine_dev',
      encrypt: true,
      trustServerCertificate: true,
      port: 1433,
      rowCollectionOnRequestCompletion: true,
      connectTimeout: 30000,
      requestTimeout: 30000,
      enableArithAbort: true,
    },
  }
];

async function testConnection(config) {
  return new Promise((resolve) => {
    console.log(`\n🔍 Testing: ${config.name}`);
    console.log('Server:', config.server);
    console.log('Database:', config.options.database);
    console.log('Username:', config.authentication.options.userName);
    console.log('Password length:', config.authentication.options.password.length);
    
    const connection = new Connection(config);
    let hasError = false;
    
    // Set a timeout to prevent hanging
    const timeout = setTimeout(() => {
      if (!hasError) {
        console.log('⏰ Connection timeout after 30 seconds');
        connection.close();
        resolve(false);
      }
    }, 30000);
    
    connection.on('connect', (err) => {
      clearTimeout(timeout);
      if (err) {
        hasError = true;
        console.error('❌ Connection failed:', err.message);
        console.error('Error code:', err.code);
        console.error('Error number:', err.number);
        connection.close();
        resolve(false);
      } else {
        console.log('✅ Connected successfully!');
        const request = new Request('SELECT 1 AS test', (err, rowCount, rows) => {
          if (err) {
            console.error('❌ Query failed:', err.message);
            connection.close();
            resolve(false);
          } else {
            console.log('✅ Query result:', rows[0][0].value);
            connection.close();
            resolve(true);
          }
        });
        connection.execSql(request);
      }
    });
    
    connection.on('end', () => {
      console.log('Connection closed.');
    });
    
    connection.on('error', (err) => {
      hasError = true;
      clearTimeout(timeout);
      console.error('❌ Connection error event:', err.message);
      console.error('Error code:', err.code);
      console.error('Error number:', err.number);
      resolve(false);
    });
    
    connection.on('debug', (message) => {
      console.log('🐛 Debug:', message);
    });
  });
}

async function testAllConfigs() {
  console.log('🚀 Testing tedious connection with multiple configurations...\n');
  
  for (const config of configs) {
    const success = await testConnection(config);
    if (success) {
      console.log(`\n🎉 SUCCESS with ${config.name}!`);
      return config;
    }
  }
  
  console.log('\n❌ All connection attempts failed.');
  console.log('Please check your credentials and network connectivity.');
}

// Load environment variables
require('dotenv').config();

testAllConfigs().then(() => {
  console.log('\nTest completed.');
  process.exit(0);
}).catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
}); 