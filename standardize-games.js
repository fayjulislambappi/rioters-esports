const mongoose = require('mongoose');

async function standardizeGames() {
    try {
        await mongoose.connect('mongodb+srv://esportsmanager:B%40ppy1200@cluster0.ph1x9l1.mongodb.net/test');

        // Define schema with defaults
        const Game = mongoose.models.Game || mongoose.model('Game', new mongoose.Schema({
            isFeatured: { type: Boolean, default: false },
            active: { type: Boolean, default: true },
            category: { type: String, default: 'FPS' }
        }, { strict: false }));

        const games = await Game.find({});
        console.log(`Found ${games.length} games. Standardizing...`);

        for (const game of games) {
            if (game.isFeatured === undefined) game.isFeatured = false;
            if (game.active === undefined) game.active = true;
            if (!game.category) game.category = 'FPS';
            await game.save();
        }

        console.log('Standardization complete.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

standardizeGames();
