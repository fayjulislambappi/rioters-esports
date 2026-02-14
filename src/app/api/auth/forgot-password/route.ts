import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import User from "@/models/User";
import nodemailer from "nodemailer";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        await connectDB();

        const user = await User.findOne({ email });

        if (!user) {
            // We return 200 even if user not found for security reasons (avoid email enumeration)
            return NextResponse.json({ message: "If an account exists with this email, you will receive a reset code." });
        }

        // Generate 6-digit code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Set expiry (10 minutes)
        user.resetPasswordToken = resetCode;
        user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000);

        await user.save();

        // Send Email
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const mailOptions = {
            from: `"Rioters Esports" <${process.env.SMTP_USER}>`,
            to: email,
            subject: "Password Reset Code - Rioters Esports",
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; background-color: #f9f9f9; border-radius: 10px;">
                <h2 style="color: #DC2626; text-align: center;">Forgot Your Password?</h2>
                <p style="font-size: 16px;">Hello,</p>
                <p style="font-size: 16px;">We received a request to reset your password for your Rioters Esports account. Please use the verification code below to proceed:</p>
                <div style="background-color: #ffffff; padding: 20px; text-align: center; border-radius: 8px; border: 1px solid #ddd; margin: 20px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #DC2626;">${resetCode}</span>
                </div>
                <p style="font-size: 14px; color: #666;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="font-size: 12px; color: #999; text-align: center;">© ${new Date().getFullYear()} Rioters Esports. All rights reserved.</p>
            </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({
            success: true,
            message: "Reset code sent to your email."
        });

    } catch (error: any) {
        console.error("Forgot Password Error:", error);
        return NextResponse.json({ error: "Something went wrong. Please try again later." }, { status: 500 });
    }
}
