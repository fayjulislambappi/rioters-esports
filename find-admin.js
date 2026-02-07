const mongoose = require('mongoose');

async function findAdmin() {
    try {
        await mongoose.connect('mongodb+srv://esportsmanager:B%40ppy1200@cluster0.ph1x9l1.mongodb.net/test');
        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
            email: String,
            role: String
        }));

        const admin = await User.findOne({ role: 'ADMIN' });
        console.log('ADMIN USER FOUND:', JSON.stringify(admin, null, 2));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

findAdmin();
