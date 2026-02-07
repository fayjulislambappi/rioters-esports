import mongoose, { Schema, Model, Document } from "mongoose";

export interface IGame extends Document {
    title: string;
    slug: string;
    description: string;
    coverImage: string;
    category: string;
    icon?: string;
    active: boolean;
    isFeatured: boolean;
}

const GameSchema = new Schema<IGame>(
    {
        title: { type: String, required: true, unique: true },
        slug: { type: String, required: true, unique: true, lowercase: true },
        description: { type: String, required: true },
        coverImage: { type: String, required: true },
        category: { type: String, default: "FPS" },
        icon: { type: String },
        active: { type: Boolean, default: true },
        isFeatured: { type: Boolean, default: false },
    },
    { timestamps: true },
);

const Game: Model<IGame> =
    mongoose.models.Game || mongoose.model<IGame>("Game", GameSchema);

export default Game;
