const { MongoClient, ObjectId } = require('mongodb');

async function main() {
    const uri = "mongodb+srv://esportsmanager:bappy1200@cluster0.ph1x9l1.mongodb.net/";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('test'); // Common default, but let's check
        const teams = db.collection('teams');
        const users = db.collection('users');

        console.log("--- Searching for Team Alpha ---");
        const team = await teams.findOne({ name: /Alpha/i });

        if (!team) {
            console.log("Team Alpha not found.");
            return;
        }

        console.log("Team Details:", JSON.stringify({
            _id: team._id,
            name: team.name,
            captainId: team.captainId,
            membersCount: team.members?.length || 0
        }, null, 2));

        if (team.captainId) {
            const captain = await users.findOne({ _id: new ObjectId(team.captainId) });
            if (captain) {
                console.log("Captain Details:", JSON.stringify({
                    _id: captain._id,
                    name: captain.name,
                    teams: captain.teams
                }, null, 2));
            } else {
                console.log("Captain document not found for ID:", team.captainId);
            }
        } else {
            console.log("Team has no captainId set.");
        }

        console.log("\n--- Checking all members of this team ---");
        if (team.members && team.members.length > 0) {
            for (const memberId of team.members) {
                const member = await users.findOne({ _id: new ObjectId(memberId) });
                if (member) {
                    const teamRole = member.teams?.find(t => t.teamId.toString() === team._id.toString());
                    console.log(`Member: ${member.name} | Role in Team: ${teamRole?.role || 'NONE'}`);
                }
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main();
