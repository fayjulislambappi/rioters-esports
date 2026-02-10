const { MongoClient } = require('mongodb');

async function main() {
    const uri = "mongodb+srv://esportsmanager:bappy1200@cluster0.ph1x9l1.mongodb.net/";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        const db = client.db('test');
        const users = db.collection('users');

        console.log("--- Fixing Admin Roles ---");

        // Find all users with role: "ADMIN" but missing it from the roles array
        const admins = await users.find({ role: "ADMIN" }).toArray();
        console.log(`Found ${admins.length} admin accounts.`);

        for (const admin of admins) {
            const currentRoles = admin.roles || [];
            if (!currentRoles.includes("ADMIN")) {
                console.log(`Updating ${admin.name} (${admin.email})...`);
                await users.updateOne(
                    { _id: admin._id },
                    { $addToSet: { roles: "ADMIN" } }
                );
            } else {
                console.log(`${admin.name} already has ADMIN role.`);
            }
        }

        console.log("Done fixing admin roles.");

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main();
