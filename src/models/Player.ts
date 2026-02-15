import mongoose, { Schema, Model, Document } from "mongoose";

export interface IGameProfile {
    game: string;        // e.g. "Valorant", "CS2"
    role: string;        // e.g. "Duelist"
    team?: mongoose.Types.ObjectId;

    // Stats (0-100)
    stats: {
        dmg: number;
        scr: number;
        fks: number;
        hs: number;
        ast: number;
        clu: number;
    };

    overall: number;     // Calculated OVR
    isActive: boolean;
}

export interface IPlayer extends Document {
    name: string;        // Real Name
    ign: string;         // In-Game Name
    slug: string;        // URL friendly IGN
    image?: string;
    country?: string;    // Country Code (ISO) or Name

    games: IGameProfile[]; // Array of game profiles (Max 3)

    socials?: {
        twitter?: string;
        twitch?: string;
        instagram?: string;
    };
    userId?: mongoose.Types.ObjectId;
}

const GameProfileSchema = new Schema({
    game: { type: String, required: true },
    role: { type: String, required: true },
    team: { type: Schema.Types.ObjectId, ref: "Team" },
    stats: {
        dmg: { type: Number, default: 0, min: 0, max: 99999 }, // Accommodate damage or high ranks
        scr: { type: Number, default: 0, min: 0, max: 99999 },
        fks: { type: Number, default: 0, min: 0, max: 99999 },
        hs: { type: Number, default: 0, min: 0, max: 99999 },
        ast: { type: Number, default: 0, min: 0, max: 99999 },
        clu: { type: Number, default: 0, min: 0, max: 99999 },
    },
    overall: { type: Number, default: 60 },
    isActive: { type: Boolean, default: true }
}, { _id: false });

const PlayerSchema = new Schema<IPlayer>(
    {
        name: { type: String, required: true },
        ign: { type: String, required: true, unique: true },
        slug: { type: String, required: true, unique: true, lowercase: true },
        image: { type: String },
        country: { type: String, default: "US" },

        games: {
            type: [GameProfileSchema],
            validate: [arrayLimit, '{PATH} exceeds the limit of 3']
        },

        socials: {
            twitter: String,
            twitch: String,
            instagram: String
        },
        userId: { type: Schema.Types.ObjectId, ref: "User" }
    },
    { timestamps: true }
);

function arrayLimit(val: any[]) {
    return val.length <= 3;
}

// Force model recompilation in dev
if (process.env.NODE_ENV === "development" && mongoose.models.Player) {
    delete mongoose.models.Player;
}

const Player: Model<IPlayer> =
    mongoose.models.Player || mongoose.model<IPlayer>("Player", PlayerSchema);

export default Player;
