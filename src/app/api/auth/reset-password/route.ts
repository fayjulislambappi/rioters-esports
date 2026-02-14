import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
    try {
        const { email, code, newPassword } = await req.json();

        if (!email || !code || !newPassword) {
            return NextResponse.json({ error: "Email, code, and new password are required" }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
        }

        await connectDB();

        const user = await User.findOne({
            email,
            resetPasswordToken: code,
            resetPasswordExpires: { $gt: new Date() } // Check if not expired
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid or expired reset code" }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        return NextResponse.json({
            success: true,
            message: "Password has been reset successfully. You can now log in."
        });

    } catch (error: any) {
        console.error("Reset Password Error:", error);
        return NextResponse.json({ error: "Something went wrong. Please try again later." }, { status: 500 });
    }
}
