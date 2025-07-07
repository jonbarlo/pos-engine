const sql = require('mssql');

// Test different connection configurations
const configs = [
  {
    name: 'Config 1 - Standard',
    user: 'pos_admin_db',
    password: 'Yyhh8hfB8D8k*sx$',
    database: '5506_software_mssql_pos_engine_dev',
    server: 'mssql001.use1.my-hosting-panel.com',
    port: 1433,
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true,
      requestTimeout: 30000,
      connectionTimeout: 30000,
      useUTC: false,
      dateStrings: true,
    }
  },
  {
    name: 'Config 2 - With Instance',
    user: 'pos_admin_db',
    password: 'Yyhh8hfB8D8k*sx$',
    database: '5506_software_mssql_pos_engine_dev',
    server: 'mssql001.use1.my-hosting-panel.com\\SQLEXPRESS',
    port: 1433,
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true,
      requestTimeout: 30000,
      connectionTimeout: 30000,
      useUTC: false,
      dateStrings: true,
    }
  },
  {
    name: 'Config 3 - With Port in Server',
    user: 'pos_admin_db',
    password: 'Yyhh8hfB8D8k*sx$',
    database: '5506_software_mssql_pos_engine_dev',
    server: 'mssql001.use1.my-hosting-panel.com,1433',
    options: {
      encrypt: false,
      trustServerCertificate: true,
      enableArithAbort: true,
      requestTimeout: 30000,
      connectionTimeout: 30000,
      useUTC: false,
      dateStrings: true,
    }
  },
  {
    name: 'Config 4 - With Encrypt',
    user: 'pos_admin_db',
    password: 'Yyhh8hfB8D8k*sx$',
    database: '5506_software_mssql_pos_engine_dev',
    server: 'mssql001.use1.my-hosting-panel.com',
    port: 1433,
    options: {
      encrypt: true,
      trustServerCertificate: true,
      enableArithAbort: true,
      requestTimeout: 30000,
      connectionTimeout: 30000,
      useUTC: false,
      dateStrings: true,
    }
  }
];

async function testConnection(config) {
  try {
    console.log(`\n🔍 Testing: ${config.name}`);
    console.log('Host:', config.server);
    console.log('Port:', config.port || 'default');
    console.log('Database:', config.database);
    console.log('Username:', config.user);
    
    const pool = await sql.connect(config);
    console.log('✅ Connection successful!');
    
    const result = await pool.request().query('SELECT 1 as test');
    console.log('✅ Query test successful:', result.recordset[0]);
    
    // Test if the users table exists
    const tableResult = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'users'
    `);
    
    if (tableResult.recordset.length > 0) {
      console.log('✅ Users table exists');
    } else {
      console.log('⚠️  Users table does not exist');
    }
    
    await pool.close();
    console.log('✅ Connection closed successfully');
    return true;
    
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    console.error('Error details:', err);
    return false;
  }
}

async function testAllConfigs() {
  console.log('🚀 Testing multiple MS SQL Server connection configurations...\n');
  
  for (const config of configs) {
    const success = await testConnection(config);
    if (success) {
      console.log(`\n🎉 SUCCESS with ${config.name}!`);
      console.log('Use this configuration in your database.ts file.');
      return config;
    }
  }
  
  console.log('\n❌ All connection attempts failed.');
  console.log('Please check:');
  console.log('1. Database credentials in TablePlus');
  console.log('2. Network connectivity');
  console.log('3. Firewall settings');
}

testAllConfigs(); 