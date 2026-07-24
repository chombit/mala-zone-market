/**
 * create_test_agent.js
 * Malazone.com — Create Test Agent Account
 * © 2026 Malazone Technologies PLC
 */
"use strict";

const db = require('./database/db');

async function createTestAgent() {
  try {
    console.log("🌱 Creating Test Agent Account...");

    // Test agent credentials
    const testAgent = {
      full_name: "Test Agent User",
      phone: "0911234567",
      sub_city: "Tabor Sub-City"
    };

    // 1. Create or get user
    let userId;
    const [[user]] = await db.execute("SELECT id FROM users WHERE phone_number = ?", [testAgent.phone]);
    
    if (user) {
      userId = user.id;
      console.log("✅ User already exists with ID:", userId);
    } else {
      const [ins] = await db.execute(
        "INSERT INTO users (full_name, phone_number, account_type, is_verified) VALUES (?, ?, 'Agent', 1)",
        [testAgent.full_name, testAgent.phone]
      );
      userId = ins.insertId;
      console.log("✅ Created user with ID:", userId);
    }

    // 2. Create or update agent profile
    const [[existingAgent]] = await db.execute("SELECT id FROM agents WHERE user_id = ?", [userId]);
    
    if (existingAgent) {
      await db.execute(
        "UPDATE agents SET sub_city = ?, status = 'active', earnings_total_etb = 0 WHERE user_id = ?",
        [testAgent.sub_city, userId]
      );
      console.log("✅ Updated existing agent profile");
    } else {
      const [agentIns] = await db.execute(
        "INSERT INTO agents (user_id, sub_city, status, earnings_total_etb) VALUES (?, ?, 'active', 0)",
        [userId, testAgent.sub_city]
      );
      console.log("✅ Created agent profile with ID:", agentIns.insertId);
    }

    // 3. Display credentials
    console.log("\n📝 TEST AGENT CREDENTIALS:");
    console.log("═══════════════════════════════════════");
    console.log("Full Name:", testAgent.full_name);
    console.log("Phone:", testAgent.phone);
    console.log("Sub-City:", testAgent.sub_city);
    console.log("Status: Active");
    console.log("═══════════════════════════════════════");
    console.log("\n🔧 USAGE:");
    console.log("Register via API:");
    console.log(`POST /api/agents/register`);
    console.log(`{`);
    console.log(`  "full_name": "${testAgent.full_name}",`);
    console.log(`  "phone": "${testAgent.phone}",`);
    console.log(`  "sub_city": "${testAgent.sub_city}"`);
    console.log(`}`);
    console.log("\nView profile:");
    console.log(`GET /api/agents/${testAgent.phone}`);
    console.log("\n✅ Test agent account ready!");

    process.exit(0);
  } catch (err) {
    console.error("❌ Failed to create test agent:", err);
    process.exit(1);
  }
}

createTestAgent();
