const mongoose = require('mongoose');

// --- SIMULATION ---
console.log("--- Starting Strict Role Logic Simulation ---");

// Mock User with existing Captain role
const mockUserCaptain = {
    _id: "user_capt_1",
    name: "Captain America",
    teams: [
        { teamId: "team_1", role: "CAPTAIN" }
    ]
};

// Mock User who is just a Member
const mockUserMember = {
    _id: "user_mem_1",
    name: "Hawkeye",
    teams: [
        { teamId: "team_1", role: "MEMBER" }
    ]
};

// Simulate POST /api/teams/create
function createTeam(user) {
    console.log(`\n> User '${user.name}' tries to create a team...`);

    const isAlreadyCaptain = user.teams?.some(t => t.role === "CAPTAIN");

    if (isAlreadyCaptain) {
        console.log("  🛑 BLOCKED: User is already a captain.");
        return { status: 400, error: "Already Captain" };
    }

    console.log("  ✅ SUCCESS: Team created (Pending).");
    return { status: 201, team: { status: "PENDING", captainId: user._id } };
}

// TEST 1: Captain tries to create another team
const res1 = createTeam(mockUserCaptain);
if (res1.status === 400) console.log("PASS: Existing Captain blocked.");
else console.error("FAIL: Existing Captain should be blocked.");

// TEST 2: Member tries to create a team (becomes captain)
const res2 = createTeam(mockUserMember);
if (res2.status === 201) console.log("PASS: Member allowed to create team.");
else console.error("FAIL: Member should be allowed.");


console.log("\n--- Simulation Complete ---");
