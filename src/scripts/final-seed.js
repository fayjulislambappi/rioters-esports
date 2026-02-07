const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Manually parse .env
const envPath = path.join(__dirname, '../../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');
const env = {};
lines.forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
    }
});

const uri = env.MONGODB_URI;

// Define User Schema (Simplified)
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: { type: String, enum: ["USER", "TEAM_MANAGER", "ADMIN"], default: "USER" },
    provider: { type: String, default: "credentials" }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
    try {
        await mongoose.connect(uri);
        console.log('Connected to DB');

        const email = "abc@gmail.com";
        const password = "admin@123";

        const existing = await User.findOne({ email });
        if (existing) {
            console.log('User already exists');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            name: "Admin User",
            email,
            password: hashedPassword,
            role: "ADMIN"
        });

        console.log('✅ Admin user created successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

seed();
