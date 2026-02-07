import mongoose, { Schema, Model, Document } from "mongoose";

export interface IPlayerProfile extends Document {
    userId: mongoose.Types.ObjectId;
    gameId: mongoose.Types.ObjectId;
    ign: string; // In-Game Name
    rank: string;
    role: string; // e.g., Duelist, Support, AWPer
    stats: Record<string, any>; // Flexible object for different games
}

const PlayerProfileSchema = new Schema<IPlayerProfile>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        gameId: { type: Schema.Types.ObjectId, ref: "Game", required: true },
        ign: { type: String, required: true },
        rank: { type: String, required: true },
        role: { type: String, required: true },
        stats: { type: Map, of: Schema.Types.Mixed, default: {} },
    },
    { timestamps: true },
);

// Compound index to ensure one profile per game per user
PlayerProfileSchema.index({ userId: 1, gameId: 1 }, { unique: true });

const PlayerProfile: Model<IPlayerProfile> =
    mongoose.models.PlayerProfile ||
    mongoose.model<IPlayerProfile>("PlayerProfile", PlayerProfileSchema);

export default PlayerProfile;
