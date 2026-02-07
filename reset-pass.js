const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function resetPassword() {
    try {
        await mongoose.connect('mongodb+srv://esportsmanager:B%40ppy1200@cluster0.ph1x9l1.mongodb.net/test');
        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({
            email: String,
            password: String
        }));

        const hashedPassword = await bcrypt.hash('admin123', 10);
        await User.updateOne({ email: 'abc@gmail.com' }, { password: hashedPassword });
        console.log('PASSWORD UPDATED FOR abc@gmail.com');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

resetPassword();
