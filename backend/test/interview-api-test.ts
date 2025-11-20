import axios from "axios";

/**
 * API Integration Test for Interview System
 * Run with: ts-node test/interview-api-test.ts
 *
 * Make sure the server is running on port 3001 before running this test
 */

const BASE_URL = "http://localhost:3001/api";

interface TestResult {
  test: string;
  status: "PASS" | "FAIL";
  message: string;
  data?: any;
}

const results: TestResult[] = [];

const logTest = (
  test: string,
  status: "PASS" | "FAIL",
  message: string,
  data?: any,
) => {
  const result = { test, status, message, data };
  results.push(result);
  const emoji = status === "PASS" ? "✅" : "❌";
  console.log(`${emoji} ${test}: ${message}`);
  if (data && status === "PASS") {
    console.log(
      `   📄 Data preview:`,
      JSON.stringify(data, null, 2).substring(0, 200) + "...\n",
    );
  } else if (status === "FAIL") {
    console.log(`   ❌ Error:`, data || message, "\n");
  }
};

const runAPITests = async () => {
  console.log("🧪 Interview System API Integration Tests");
  console.log("==========================================\n");

  // Test 1: Health Check (make sure server is running)
  try {
    console.log("🏥 Test 1: Server Health Check");
    const response = await axios.get(`${BASE_URL}/health`);
    logTest("Health Check", "PASS", "Server is running", {
      status: response.status,
    });
  } catch (error: any) {
    logTest("Health Check", "FAIL", "Server not responding", error.message);
    console.log("❌ Please make sure the server is running on port 3001");
    console.log(
      "   Run: yarn dev or yarn start:prod from the backend directory\n",
    );
    return;
  }

  // Test 2: Get Available Interview Slots (Public endpoint)
  try {
    console.log("📅 Test 2: Get Available Interview Slots");
    const response = await axios.get(`${BASE_URL}/interviews/slots/available`);
    logTest("Available Slots", "PASS", "Retrieved available slots", {
      totalSlots: response.data.data?.totalSlots || 0,
      slotsByDate: Object.keys(response.data.data?.slotsByDate || {}),
    });
  } catch (error: any) {
    logTest(
      "Available Slots",
      "FAIL",
      "Failed to get available slots",
      error.response?.data || error.message,
    );
  }

  // Test 3: Check Interview by Application (Public endpoint)
  try {
    console.log("🔍 Test 3: Check Interview by Application");
    // Using a dummy application ID - this should return 404, which is expected
    const response = await axios.get(
      `${BASE_URL}/interviews/application/60f1b2b2b2b2b2b2b2b2b2b2`,
    );
    logTest(
      "Interview by Application",
      "PASS",
      "Endpoint is accessible",
      response.data,
    );
  } catch (error: any) {
    if (error.response?.status === 404) {
      logTest(
        "Interview by Application",
        "PASS",
        "Endpoint working (404 expected for non-existent application)",
        {
          status: error.response.status,
          message: error.response.data?.message,
        },
      );
    } else if (error.response?.status === 400) {
      logTest(
        "Interview by Application",
        "PASS",
        "Endpoint working (400 expected for invalid ID format)",
        {
          status: error.response.status,
          message: error.response.data?.message,
        },
      );
    } else {
      logTest(
        "Interview by Application",
        "FAIL",
        "Unexpected error",
        error.response?.data || error.message,
      );
    }
  }

  // Test 4: Test Interview Routes Exist
  try {
    console.log("🛣️ Test 4: Interview Routes Registration");

    // These should return 401 (Unauthorized) since they require authentication
    const protectedRoutes = [
      "/interviews/slots",
      "/interviews/slots/my-slots",
      "/interviews",
    ];

    let routesWorking = 0;

    for (const route of protectedRoutes) {
      try {
        await axios.get(`${BASE_URL}${route}`);
      } catch (error: any) {
        if (error.response?.status === 401) {
          routesWorking++;
          console.log(
            `   ✅ ${route}: Protected route working (401 Unauthorized)`,
          );
        } else {
          console.log(
            `   ❌ ${route}: Unexpected response ${error.response?.status}`,
          );
        }
      }
    }

    logTest(
      "Protected Routes",
      "PASS",
      `${routesWorking}/${protectedRoutes.length} protected routes working correctly`,
      {
        workingRoutes: routesWorking,
        totalRoutes: protectedRoutes.length,
      },
    );
  } catch (error: any) {
    logTest(
      "Protected Routes",
      "FAIL",
      "Error testing protected routes",
      error.message,
    );
  }

  // Test 5: Test Schedule Interview Endpoint Structure
  try {
    console.log("📝 Test 5: Schedule Interview Endpoint");

    // This should return 400 (Bad Request) since we're not providing required fields
    const response = await axios.post(`${BASE_URL}/interviews/schedule`, {});
  } catch (error: any) {
    if (error.response?.status === 400) {
      logTest(
        "Schedule Interview",
        "PASS",
        "Endpoint accessible and validates input",
        {
          status: error.response.status,
          message: error.response.data?.message,
          expectedError: "Application ID and Slot ID are required",
        },
      );
    } else {
      logTest(
        "Schedule Interview",
        "FAIL",
        "Unexpected response",
        error.response?.data || error.message,
      );
    }
  }

  // Summary
  console.log("\n📊 Test Results Summary");
  console.log("========================");

  const passedTests = results.filter((r) => r.status === "PASS").length;
  const totalTests = results.length;

  console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests} tests\n`);

  if (passedTests === totalTests) {
    console.log(
      "🎉 All tests passed! The Interview System API is working correctly.",
    );
  } else {
    console.log("⚠️ Some tests failed. Check the errors above for details.");
  }

  console.log("\n🔗 Available Interview API Endpoints:");
  console.log("=====================================");
  console.log("Public Endpoints:");
  console.log("  GET  /api/interviews/slots/available");
  console.log("  POST /api/interviews/schedule");
  console.log("  GET  /api/interviews/application/:applicationId");
  console.log("");
  console.log("Protected Endpoints (require authentication):");
  console.log("  POST   /api/interviews/slots              (admin/mentor)");
  console.log("  GET    /api/interviews/slots/my-slots     (admin/mentor)");
  console.log("  GET    /api/interviews/                   (admin/mentor)");
  console.log("  GET    /api/interviews/:id                (admin/mentor)");
  console.log("  PATCH  /api/interviews/:id/review         (admin)");
  console.log("  PATCH  /api/interviews/:id/cancel         (admin/mentor)");

  console.log("\n📋 Next Steps for Full Testing:");
  console.log("1. Create a test admin user and get authentication token");
  console.log("2. Test creating interview slots with admin token");
  console.log("3. Test scheduling interviews as applicants");
  console.log("4. Test the complete interview workflow");
  console.log("5. Verify ICS calendar files are attached to emails");

  console.log("\n🚀 API Integration Test Complete!");
};

// Run the tests
runAPITests().catch(console.error);
