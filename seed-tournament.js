const mongoose = require('mongoose');

async function seedTournament() {
    try {
        await mongoose.connect('mongodb+srv://esportsmanager:B%40ppy1200@cluster0.ph1x9l1.mongodb.net/test');
        console.log("Connected to DB");

        // 1. Find or Create Game
        const Game = mongoose.models.Game || mongoose.model('Game', new mongoose.Schema({ title: String, slug: String }, { strict: false }));
        let game = await Game.findOne({ title: "Valorant" });
        if (!game) {
            game = await Game.create({
                title: "Valorant",
                slug: "valorant",
                image: "https://images.unsplash.com/photo-1624138784181-dc7cc7539698?q=80&w=1000",
                description: "5v5 Character-based Tactical Shooter"
            });
            console.log("Created Game: Valorant");
        } else {
            console.log("Found Game: Valorant");
        }

        // 2. Create Tournament
        const Tournament = mongoose.models.Tournament || mongoose.model('Tournament', new mongoose.Schema({
            title: String,
            gameId: mongoose.Schema.Types.ObjectId,
            description: String,
            rules: String,
            prizePool: String,
            startDate: Date,
            endDate: Date,
            registrationDeadline: Date,
            maxTeams: Number,
            registeredTeams: [mongoose.Schema.Types.ObjectId],
            status: String,
            image: String
        }, { timestamps: true }));

        const tournament = await Tournament.create({
            title: "Valorant Champions 2025",
            gameId: game._id,
            description: "The ultimate showdown for the best Valorant teams. Compete for glory!",
            rules: "1. 5v5 Standard\n2. Single Elimination\n3. Map Veto",
            prizePool: "$25,000",
            startDate: new Date(Date.now() + 86400000 * 7), // 7 days from now
            endDate: new Date(Date.now() + 86400000 * 14),
            registrationDeadline: new Date(Date.now() + 86400000 * 5),
            maxTeams: 16,
            registeredTeams: [],
            status: "UPCOMING",
            image: "https://images.unsplash.com/photo-1624138784181-dc7cc7539698?q=80&w=1500"
        });

        console.log("Created Tournament:", tournament.title);
        console.log("ID:", tournament._id);

    } catch (error) {
        console.error("Error seeding:", error);
    } finally {
        await mongoose.disconnect();
    }
}

seedTournament();
