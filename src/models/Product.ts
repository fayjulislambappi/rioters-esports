import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
    name: string;
    slug: string;
    price: number;
    category: string;
    image: string;
    description?: string;
    optionGroups?: {
        name: string;
        type: 'selection' | 'input';
        options?: { name: string, price: number, inStock?: boolean }[];
        placeholder?: string;
        required?: boolean;
    }[];
    requiresSize?: boolean;
    sizeType?: 'footwear' | 'apparel' | null;
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
        optionGroups: [{
            name: { type: String, required: true },
            type: { type: String, enum: ['selection', 'input'], required: true },
            options: [{
                name: { type: String, required: true },
                price: { type: Number, required: true },
                inStock: { type: Boolean, default: true }
            }],
            placeholder: { type: String },
            required: { type: Boolean, default: false }
        }],
        requiresSize: { type: Boolean, default: false },
        sizeType: { type: String, enum: ['footwear', 'apparel', null], default: null },
        active: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Product: Model<IProduct> =
    mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
