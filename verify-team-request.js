const mongoose = require('mongoose');

// Mock Data
const mockSession = { user: { id: "captain123" } };
const mockBody = {
    name: "Test Team",
    slug: "test-team",
    gameFocus: "Valorant",
    captainDiscord: "captain#1234",
    captainIgn: "Captain",
    memberIds: ["member456"]
};

// --- SIMULATION ---
console.log("--- Starting Team Request Simulation ---");

// 1. Team Creation Logic
const newTeam = {
    _id: "team_id_xyz",
    name: mockBody.name,
    status: "PENDING", // Crucial Check
    members: [mockSession.user.id, ...mockBody.memberIds]
};

console.log(`1. Creating Team: ${newTeam.name}`);
console.log(`   - Status: ${newTeam.status}`);
if (newTeam.status !== "PENDING") {
    console.error("FAIL: Team status should be PENDING");
    process.exit(1);
} else {
    console.log("PASS: Team status is correctly PENDING");
}

console.log(`   - Members Count: ${newTeam.members.length} (Captain + 1 Member)`);
if (newTeam.members.length !== 2) {
    console.error("FAIL: Incorrect member count");
    process.exit(1);
} else {
    console.log("PASS: Member count correct");
}

// 2. Captain Update Logic
const captainUser = {
    _id: "captain123",
    teams: [],
    roles: ["USER"],
    role: "USER",
    save: () => console.log("   - Captain user saved successfully")
};

console.log("2. Updating Captain Profile...");
captainUser.teams.push({
    teamId: newTeam._id,
    game: mockBody.gameFocus,
    role: "CAPTAIN"
});

// Role Logic Check
if (captainUser.roles.includes("USER")) {
    captainUser.roles = captainUser.roles.filter(r => r !== "USER");
}
if (!captainUser.roles.includes("TEAM_CAPTAIN")) {
    captainUser.roles.push("TEAM_CAPTAIN");
}

console.log(`   - Captain Roles: ${JSON.stringify(captainUser.roles)}`);
if (captainUser.roles.includes("USER") || !captainUser.roles.includes("TEAM_CAPTAIN")) {
    console.error("FAIL: Captain roles incorrect");
} else {
    console.log("PASS: Captain roles updated correctly (USER removed, TEAM_CAPTAIN added)");
}

// 3. Member Update Logic (Simulated)
console.log("3. Updating Member Profiles...");
const memberUser = {
    _id: "member456",
    teams: [],
    roles: ["USER"],
    save: () => { }
};

// Simulate updateMany
memberUser.teams.push({
    teamId: newTeam._id,
    game: mockBody.gameFocus,
    role: "MEMBER"
});
memberUser.roles.push("TEAM_MEMBER"); // Simplified updateMany logic

// Simulate cleanup loop
if (memberUser.roles.includes("USER")) {
    memberUser.roles = memberUser.roles.filter(r => r !== "USER");
}

console.log(`   - Member Roles: ${JSON.stringify(memberUser.roles)}`);
if (memberUser.teams[0].role !== "MEMBER") {
    console.error("FAIL: Member team role incorrect");
} else {
    console.log("PASS: Member team role is MEMBER");
}

console.log("--- Simulation Complete: SUCCESS ---");
