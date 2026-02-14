import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user || !session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { newPassword } = body;

        if (!newPassword) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: "New password must be at least 6 characters long" }, { status: 400 });
        }

        await connectDB();

        const user = await User.findById(session.user.id).select("+password");

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user
        user.password = hashedPassword;
        await user.save();

        return NextResponse.json({
            success: true,
            message: "Password updated successfully!"
        });

    } catch (error: any) {
        console.error("Change Password Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
