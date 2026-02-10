const { MongoClient } = require('mongodb');

async function main() {
    const uri = "mongodb+srv://esportsmanager:bappy1200@cluster0.ph1x9l1.mongodb.net/";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('test');
        const teams = db.collection('teams');

        console.log("--- Checking Team Statuses ---");
        const allTeams = await teams.find({}).toArray();
        console.log(`Found ${allTeams.length} teams.`);

        for (const team of allTeams) {
            if (team.status !== "APPROVED") {
                console.log(`Updating ${team.name} status to APPROVED...`);
                await teams.updateOne(
                    { _id: team._id },
                    { $set: { status: "APPROVED" } }
                );
            } else {
                console.log(`${team.name} is already APPROVED.`);
            }
        }

        console.log("Done fixing team statuses.");

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main();
