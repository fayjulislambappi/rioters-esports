import mongoose, { Schema, Document, Model } from "mongoose";

export interface INews extends Document {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    image: string;
    author: string;
    category: "Tournament" | "Update" | "Competition" | "General";
    gallery: string[];
    published: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const NewsSchema: Schema<INews> = new Schema(
    {
        title: { type: String, required: true },
        slug: { type: String, required: true, unique: true },
        excerpt: { type: String, required: true },
        content: { type: String, required: true },
        image: { type: String, required: true },
        author: { type: String, default: "Rioters Editorial" },
        category: {
            type: String,
            enum: ["Tournament", "Update", "Competition", "General"],
            default: "General",
        },
        gallery: { type: [String], default: [] },
        published: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const News: Model<INews> =
    mongoose.models.News || mongoose.model<INews>("News", NewsSchema);

export default News;
