const mongoose = require('mongoose');

async function fixCS2() {
    try {
        const uri = "mongodb+srv://esportsmanager:bappy1200@cluster0.ph1x9l1.mongodb.net/test";
        await mongoose.connect(uri);
        console.log("Connected to DB");

        const Game = mongoose.models.Game || mongoose.model('Game', new mongoose.Schema({
            title: String
        }, { strict: false }));

        // Find matches with space or hyphen
        const games = await Game.find({ title: { $regex: /Counter.*Strike/i } });
        console.log("Found games:", games.map(g => g.title));

        for (const g of games) {
            if (g.title !== "Counter-Strike 2") {
                console.log(`Updating ${g.title} to Counter-Strike 2`);
                g.title = "Counter-Strike 2";
                // Ensure slug is clean too if needed, but title is critical
                await g.save();
            } else {
                console.log(`${g.title} is already correct.`);
            }
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

fixCS2();
