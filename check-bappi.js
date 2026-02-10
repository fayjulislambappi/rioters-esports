const { MongoClient, ObjectId } = require('mongodb');

async function main() {
    const uri = "mongodb+srv://esportsmanager:bappy1200@cluster0.ph1x9l1.mongodb.net/";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('test');
        const users = db.collection('users');

        const bappi = await users.findOne({ name: "Bappi" });
        if (bappi) {
            console.log("Bappi's teams:", JSON.stringify(bappi.teams, null, 2));
        } else {
            console.log("Bappi not found");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main();
