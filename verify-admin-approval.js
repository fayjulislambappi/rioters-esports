const mongoose = require('mongoose');

// --- SIMULATION ---
console.log("--- Starting Admin Approval Simulation ---");

// Mock Models
const mockTeam = {
    _id: "team_pending_123",
    name: "Pending Team",
    status: "PENDING"
};

// Simulate PUT /api/admin/teams
async function updateTeamStatus(id, status) {
    console.log(`\n> Simulating API Request: PUT /api/admin/teams ({ id: ${id}, status: ${status} })`);

    if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
        console.error("  FAIL: Invalid status");
        return;
    }

    if (id === mockTeam._id) {
        mockTeam.status = status;
        console.log(`  SUCCESS: Team status updated to ${mockTeam.status}`);
        return mockTeam;
    }
}

// TEST 1: Approve
updateTeamStatus("team_pending_123", "APPROVED");
if (mockTeam.status !== "APPROVED") console.error("FAIL: Status mismatch");
else console.log("PASS: Status is APPROVED");

// TEST 2: Reject
updateTeamStatus("team_pending_123", "REJECTED");
if (mockTeam.status !== "REJECTED") console.error("FAIL: Status mismatch");
else console.log("PASS: Status is REJECTED");

console.log("\n--- Simulation Complete ---");
