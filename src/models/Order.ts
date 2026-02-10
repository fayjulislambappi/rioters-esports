import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOrder extends Document {
    orderId: string;
    user?: string; // Optional: Link to User ID if authenticated
    items: {
        id: string | number;
        name: string;
        price: number;
        quantity: number;
        image: string;
        selectedOptions?: { [key: string]: any };
    }[];
    totalAmount: number;
    paymentMethod: "bkash" | "nagad" | "bank";
    paymentDetails: {
        senderNumber: string;
        transactionId: string;
    };
    shippingDetails: {
        firstName: string;
        lastName: string;
        email: string;
        address: string;
        city: string;
        zip: string;
    };
    status: "pending" | "processing" | "completed" | "cancelled";
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema: Schema<IOrder> = new Schema(
    {
        orderId: { type: String, required: true, unique: true },
        user: { type: String, required: false }, // Store user ID or email if needed
        items: [
            {
                id: { type: Schema.Types.Mixed, required: true },
                name: { type: String, required: true },
                price: { type: Number, required: true },
                quantity: { type: Number, required: true },
                image: { type: String, required: false },
                selectedOptions: { type: Schema.Types.Mixed, required: false },
            },
        ],
        totalAmount: { type: Number, required: true },
        paymentMethod: {
            type: String,
            enum: ["bkash", "nagad", "bank"],
            required: true,
        },
        paymentDetails: {
            senderNumber: { type: String, required: true },
            transactionId: { type: String, required: true },
        },
        shippingDetails: {
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            email: { type: String, required: true },
            address: { type: String, required: true },
            city: { type: String, required: true },
            zip: { type: String, required: true },
        },
        status: {
            type: String,
            enum: ["pending", "processing", "completed", "cancelled"],
            default: "pending",
        },
    },
    { timestamps: true }
);

// Prevent overwrite on hot reload
const Order: Model<IOrder> =
    mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
