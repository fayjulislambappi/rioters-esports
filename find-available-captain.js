const { MongoClient, ObjectId } = require('mongodb');

async function main() {
    const uri = "mongodb+srv://esportsmanager:bappy1200@cluster0.ph1x9l1.mongodb.net/";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('test');
        const teams = db.collection('teams');
        const users = db.collection('users');

        const team = await teams.findOne({ name: /Alpha/i });
        const memberIds = team.members;

        console.log("Checking availability for members of Team Alpha...");
        for (const mId of memberIds) {
            const user = await users.findOne({ _id: new ObjectId(mId) });
            const existingCaptainRole = user.teams?.find(t => t.role === "CAPTAIN" && t.teamId.toString() !== team._id.toString());

            if (existingCaptainRole) {
                console.log(`- ${user.name}: BUSY (Already Captain of team ${existingCaptainRole.teamId})`);
            } else {
                console.log(`- ${user.name}: AVAILABLE`);
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main();
