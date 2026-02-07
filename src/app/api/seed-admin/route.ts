import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function GET() {
    try {
        await connectDB();

        const email = "abc@gmail.com";
        const password = "admin@123";
        const name = "Admin User";

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({
                message: "User already exists",
                user: { email: existingUser.email, role: existingUser.role }
            });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create Admin User
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "ADMIN",
            provider: "credentials",
            image: "https://ui-avatars.com/api/?name=Admin+User&background=random"
        });

        return NextResponse.json({
            success: true,
            message: "Admin user created successfully",
            credentials: {
                email,
                password: "admin@123 (hashed stored)"
            },
            user: {
                id: newUser._id,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error: any) {
        console.error("Seed Admin Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
