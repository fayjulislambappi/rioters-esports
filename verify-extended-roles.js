const mongoose = require('mongoose');

// --- SIMULATION ---
console.log("--- Starting Extended Role Logic Simulation ---");

// Mock User with existing roles
const mockUser = {
    _id: "user_123",
    name: "Tony Stark",
    teams: [
        { teamId: "team_A", role: "CAPTAIN" },
        { teamId: "team_B", role: "ADMIN" }
    ]
};

// Simulation of Strict Check Logic (from APIs)
function assignRole(user, targetTeamId, proposedRole) {
    console.log(`\n> Assigning '${proposedRole}' to ${user.name} for Team '${targetTeamId}'...`);

    // 1. Strict Role Check: If proposed role is CAPTAIN or ADMIN, verify they aren't already that in another team
    if (proposedRole === "CAPTAIN" || proposedRole === "ADMIN") {
        const isAlreadyThatRole = user.teams?.some(t => t.role === proposedRole && t.teamId !== targetTeamId);
        if (isAlreadyThatRole) {
            console.log(`  🛑 BLOCKED: User is already a ${proposedRole === "CAPTAIN" ? "Captain" : "Admin"} of another team.`);
            return { status: 400, error: `Already ${proposedRole}` };
        }
    }

    console.log(`  ✅ SUCCESS: Role '${proposedRole}' assigned.`);
    return { status: 200 };
}

// TEST 1: User tries to be CAPTAIN of another team
const res1 = assignRole(mockUser, "team_C", "CAPTAIN");
if (res1.status === 400) console.log("PASS: Multi-Captaincy blocked.");
else console.error("FAIL: Multi-Captaincy should be blocked.");

// TEST 2: User tries to be ADMIN of another team
const res2 = assignRole(mockUser, "team_C", "ADMIN");
if (res2.status === 400) console.log("PASS: Multi-Admin role blocked.");
else console.error("FAIL: Multi-Admin role should be blocked.");

// TEST 3: User tries to be PLAYER of another team
const res3 = assignRole(mockUser, "team_C", "PLAYER");
if (res3.status === 200) console.log("PASS: Multi-Player membership allowed.");
else console.error("FAIL: Multi-Player should be allowed.");

// Simulation of Role Precedence Logic (from user/me)
function getPrimaryRole(roles) {
    const precedence = ["ADMIN", "TEAM_ADMIN", "TEAM_CAPTAIN", "TEAM_MEMBER", "PLAYER", "TOURNAMENT_PARTICIPANT", "USER"];
    return precedence.find(r => roles.includes(r)) || "USER";
}

console.log("\n--- Precedence Check ---");
const userRoles = ["TEAM_MEMBER", "TEAM_CAPTAIN", "TEAM_ADMIN"];
const primary = getPrimaryRole(userRoles);
console.log(`Roles: ${userRoles.join(", ")} | Primary: ${primary}`);
if (primary === "TEAM_ADMIN") console.log("PASS: TEAM_ADMIN prioritized correctly.");
else console.error("FAIL: TEAM_ADMIN should be prioritized over Captain.");

console.log("\n--- Simulation Complete ---");
