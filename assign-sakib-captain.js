const { MongoClient, ObjectId } = require('mongodb');

async function main() {
    const uri = "mongodb+srv://esportsmanager:bappy1200@cluster0.ph1x9l1.mongodb.net/";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('test');
        const teams = db.collection('teams');
        const users = db.collection('users');

        // 1. Find Team Alpha
        const team = await teams.findOne({ name: /Alpha/i });
        if (!team) {
            console.log("Team Alpha not found.");
            return;
        }

        // 2. Find Sakib
        const sakib = await users.findOne({ name: "Sakib" });
        if (!sakib) {
            console.log("Sakib not found.");
            return;
        }

        console.log(`Setting Sakib (${sakib._id}) as Captain of Team Alpha (${team._id})...`);

        // 3. Update Team document
        await teams.updateOne(
            { _id: team._id },
            { $set: { captainId: sakib._id.toString() } }
        );

        // 4. Update Sakib's teams array
        await users.updateOne(
            { _id: sakib._id, "teams.teamId": team._id.toString() },
            { $set: { "teams.$.role": "CAPTAIN" } }
        );

        // 5. Sync Sakib's global roles/role
        const updatedSakib = await users.findOne({ _id: sakib._id });
        const hasTeams = updatedSakib.teams && updatedSakib.teams.length > 0;
        const hasCaptainRole = updatedSakib.teams?.some(t => t.role === "CAPTAIN");
        const hasTeamAdminRole = updatedSakib.teams?.some(t => t.role === "ADMIN");

        let newRoles = [...(updatedSakib.roles || [])];

        // Sync flags
        if (hasTeams && !newRoles.includes("TEAM_MEMBER")) newRoles.push("TEAM_MEMBER");
        if (hasCaptainRole && !newRoles.includes("TEAM_CAPTAIN")) newRoles.push("TEAM_CAPTAIN");
        if (hasTeamAdminRole && !newRoles.includes("TEAM_ADMIN")) newRoles.push("TEAM_ADMIN");

        // Precedence
        const precedence = ["ADMIN", "TEAM_ADMIN", "TEAM_CAPTAIN", "TEAM_MEMBER", "PLAYER", "TOURNAMENT_PARTICIPANT", "USER"];
        const primaryRole = precedence.find(r => newRoles.includes(r)) || "USER";

        await users.updateOne(
            { _id: sakib._id },
            { $set: { roles: newRoles, role: primaryRole } }
        );

        console.log("SUCCESS: Team Alpha now has Sakib as Shotcaller.");

    } catch (e) {
        console.error("Error during update:", e);
    } finally {
        await client.close();
    }
}

main();
