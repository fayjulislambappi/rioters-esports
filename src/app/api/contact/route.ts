import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
    try {
        const { name, email, phone, message } = await req.json();

        // Basic validation
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: "Required fields missing (Name, Email, Message)" },
                { status: 400 }
            );
        }

        // Configure SMTP transporter using existing .env credentials
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: process.env.SMTP_PORT === "465", // Use SSL for 465, TLS for 587
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Construct official HTML email
        const mailOptions = {
            from: `"Rioters Platform" <${process.env.SMTP_USER}>`,
            to: "riotersgaming43@gmail.com",
            replyTo: email,
            subject: `[HQ Transmission] New Contact Form Submission from ${name}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0c0c0c; color: #ffffff; padding: 40px; border: 1px solid #ff1241;">
                    <h2 style="color: #ff1241; text-transform: uppercase; letter-spacing: 2px;">HQ Surveillance Report</h2>
                    <p style="color: #666; text-transform: uppercase; font-size: 10px; font-weight: bold;">Transmission received from contact portal</p>
                    
                    <div style="margin-top: 30px; background-color: #1a1a1a; padding: 20px; border-radius: 8px;">
                        <p><strong>Personnel Name:</strong> ${name}</p>
                        <p><strong>Identify (Email):</strong> ${email}</p>
                        <p><strong>Mobile Link (Phone):</strong> ${phone || "Not provided"}</p>
                    </div>

                    <div style="margin-top: 20px; border-top: 1px solid #333; padding-top: 20px;">
                        <h3 style="color: #ffffff; font-size: 14px; text-transform: uppercase;">Message Content</h3>
                        <p style="color: #ccc; line-height: 1.6; font-style: italic; background-color: #000; padding: 15px; border-radius: 4px;">
                            ${message}
                        </p>
                    </div>

                    <div style="margin-top: 40px; text-align: center; border-top: 1px solid #333; padding-top: 20px;">
                        <p style="color: #444; font-size: 10px; text-transform: uppercase;">© 2026 Rioters Gaming • Internal Protocol</p>
                    </div>
                </div>
            `,
        };

        // Send email
        await transporter.sendMail(mailOptions);

        return NextResponse.json(
            { message: "Transmission successfully relayed to HQ" },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("SMTP Relay Error:", error);
        return NextResponse.json(
            { error: "Transmission failed. Protocol error." },
            { status: 500 }
        );
    }
}
