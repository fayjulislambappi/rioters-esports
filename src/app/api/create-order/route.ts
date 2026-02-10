import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

export async function POST(req: Request) {
    try {
        await connectDB();

        const body = await req.json();
        const { items, paymentMethod, paymentDetails, shippingDetails, totalAmount } = body;

        const orderId = `ORD-${Date.now()}`;

        // 1. Save Order to Database
        const newOrder = await Order.create({
            orderId,
            items,
            totalAmount,
            paymentMethod,
            paymentDetails,
            shippingDetails,
            status: "pending"
        });

        console.log("Order Created:", newOrder._id);

        // 2. Send Email Notification
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
            to: `${process.env.SMTP_USER}, ${shippingDetails.email}`, // Send to Admin & Customer
            subject: `New Order #${orderId} - Rioters Esports`,
            html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h1 style="color: #DC2626;">New Order Received!</h1>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Total Amount:</strong> BDT ${totalAmount.toFixed(2)}</p>
                <p><strong>Payment Method:</strong> ${paymentMethod.toUpperCase()}</p>
                <p><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</p>
                <p><strong>Sender Number:</strong> ${paymentDetails.senderNumber}</p>
                
                <h3>Shipping Details</h3>
                <p>
                    ${shippingDetails.firstName} ${shippingDetails.lastName}<br>
                    ${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.zip}<br>
                    ${shippingDetails.email}
                </p>

                <h3>Order Items</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Item</th>
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Options</th>
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Qty</th>
                            <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${items.map((item: any) => `
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;">${item.name}</td>
                                <td style="padding: 10px; border: 1px solid #ddd; font-size: 11px; color: #666;">
                                    ${item.selectedOptions ? Object.entries(item.selectedOptions).map(([k, v]: [string, any]) => `<b>${k}:</b> ${typeof v === 'object' ? v.name : v}`).join('<br>') : 'N/A'}
                                </td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${item.quantity}</td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${(item.price * item.quantity).toFixed(0)} Tk</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `,
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log("Email sent successfully");
        } catch (emailError) {
            console.error("Failed to send email:", emailError);
            // Continue execution, don't fail the order just because email failed (in production you might queue this)
        }

        // Simulate database delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return NextResponse.json({
            success: true,
            orderId: orderId,
            message: "Order placed successfully! Please wait for verification."
        });
    } catch (error: any) {
        console.error("Order Creation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
