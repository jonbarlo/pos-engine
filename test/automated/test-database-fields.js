const axios = require("axios");

// Configuration
const BASE_URL = "http://localhost:3031/api";
const TEST_BUSINESS_ID = 1;

// Test credentials (copy from last working test)
const TEST_CREDENTIALS = {
  email: "marco@italiandelight.com",
  password: "Password123"
};

let authToken = "";

// Helper function to get auth token
async function getAuthToken() {
  try {
    console.log(" Authenticating...");
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: TEST_CREDENTIALS.email,
      password: TEST_CREDENTIALS.password,
      businessSlug: "italian-delight"
    });

    if (response.data.token) {
      authToken = response.data.token;
      console.log(" Authentication successful");
      return true;
    } else {
      console.log(" Authentication failed:", response.data);
      return false;
    }
  } catch (error) {
    console.log(" Authentication error:", error.response?.data || error.message);
    return false;
  }
}

// Test database fields
async function testDatabaseFields() {
  console.log("\n Testing Database Fields...\n");

  try {
    // Get items to check for new inventory tracking fields
    console.log("1 Fetching items to check inventory tracking fields...");
    
    const response = await axios.get(`${BASE_URL}/items`, {
      headers: {
        ...(authToken && { "Authorization": `Bearer ${authToken}` })
      }
    });

    if (response.data.success && response.data.items && response.data.items.length > 0) {
      const item = response.data.items[0];
      console.log(" Items endpoint working");
      
      // Check for new inventory tracking fields
      const requiredFields = [
        "expirationDate",
        "manufacturingDate", 
        "shelfLifeDays",
        "lastSoldDate",
        "salesVelocity",
        "daysSinceLastSale",
        "isPerishable",
        "isUnderperforming",
        "isExpiringSoon"
      ];

      console.log("\n2 Checking for inventory tracking fields...");
      let allFieldsPresent = true;
      
      requiredFields.forEach(field => {
        if (item.hasOwnProperty(field)) {
          console.log(` Field "${field}" present`);
        } else {
          console.log(` Field "${field}" missing`);
          allFieldsPresent = false;
        }
      });

      if (allFieldsPresent) {
        console.log("\n All inventory tracking fields are present!");
        
        // Show sample data
        console.log("\n3 Sample inventory tracking data:");
        console.log(`   Expiration Date: ${item.expirationDate || "Not set"}`);
        console.log(`   Manufacturing Date: ${item.manufacturingDate || "Not set"}`);
        console.log(`   Shelf Life (days): ${item.shelfLifeDays || "Not set"}`);
        console.log(`   Last Sold Date: ${item.lastSoldDate || "Not set"}`);
        console.log(`   Sales Velocity: ${item.salesVelocity || "0.00"}`);
        console.log(`   Days Since Last Sale: ${item.daysSinceLastSale || "0"}`);
        console.log(`   Is Perishable: ${item.isPerishable ? "Yes" : "No"}`);
        console.log(`   Is Underperforming: ${item.isUnderperforming ? "Yes" : "No"}`);
        console.log(`   Is Expiring Soon: ${item.isExpiringSoon ? "Yes" : "No"}`);
      } else {
        console.log("\n Some inventory tracking fields are missing");
      }
    } else {
      console.log(" No items found or invalid response");
    }

  } catch (error) {
    console.log(" Error testing database fields:", error.response?.data || error.message);
  }
}

// Main test execution
async function runTests() {
  console.log(" Starting Database Fields Test...\n");
  
  // Authenticate first
  const authSuccess = await getAuthToken();
  if (!authSuccess) {
    console.log(" Cannot proceed without authentication");
    return;
  }

  // Run tests
  await testDatabaseFields();
  
  console.log("\n All tests completed!");
}

// Run the tests
runTests().catch(console.error);
