const mongoose = require('mongoose');

// Define a minimal schema inline
const userSchema = new mongoose.Schema({ email: String }, { strict: false });
const User = mongoose.model('User', userSchema, 'users');

const MONGODB_URI = 'mongodb+srv://esportsmanager:bappy1200@cluster0.ph1x9l1.mongodb.net/';

async function checkUser() {
    console.log("Connecting to DB...");
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected.");

        const email = 'fayjulbappy@gmail.com';
        const user = await User.findOne({ email });

        if (user) {
            console.log(`User found: ${user.email} (ID: ${user._id})`);
            console.log("Full user object:", user);
        } else {
            console.log(`User with email ${email} NOT found.`);
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected.");
    }
}

checkUser();
