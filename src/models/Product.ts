import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
    name: string;
    slug: string;
    price: number;
    category: string;
    image: string;
    description?: string;
    variants?: { name: string, price: number }[];
    addOns?: { name: string, price: number }[];
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema: Schema<IProduct> = new Schema(
    {
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        price: { type: Number, required: true },
        category: { type: String, required: true },
        image: { type: String, required: true },
        description: { type: String },
        variants: [{
            name: { type: String, required: true },
            price: { type: Number, required: true }
        }],
        addOns: [{
            name: { type: String, required: true },
            price: { type: Number, required: true }
        }],
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Product: Model<IProduct> =
    mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
