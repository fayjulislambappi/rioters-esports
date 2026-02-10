import mongoose, { Schema, Model, Document } from "mongoose";

export interface ITeam extends Document {
    name: string;
    slug: string;
    tag?: string;
    logo?: string;
    description?: string;
    captainId: mongoose.Types.ObjectId;
    captainDiscord: string;
    members: mongoose.Types.ObjectId[]; // Includes captain
    lineup?: { ign: string; discord: string }[];
    substitutes?: { ign: string; discord: string }[];
    gameFocus?: string; // Primary game they play
    recruiting: boolean;
    socials?: {
        twitter?: string;
        website?: string;
    };
    isOfficial?: boolean;
    isBanned?: boolean;
}

const TeamSchema = new Schema<ITeam>(
    {
        name: { type: String, required: true, unique: true },
        tag: { type: String }, // Team Tag (e.g. TSM)
        slug: { type: String, required: true, unique: true, lowercase: true },
        logo: { type: String },
        description: { type: String },
        captainId: { type: Schema.Types.ObjectId, ref: "User", required: false },
        captainDiscord: { type: String, required: false }, // Captain's personal Discord (Optional for Admin created teams)
        members: [{ type: Schema.Types.ObjectId, ref: "User" }],
        gameFocus: { type: String, required: true },
        recruiting: { type: Boolean, default: false },
        lineup: [{
            ign: { type: String, required: true },
            discord: { type: String, required: true }
        }], // Main roster: IGN + Discord
        substitutes: [{
            ign: { type: String },
            discord: { type: String }
        }], // Subs: IGN + Discord
        socials: {
            twitter: String,
            website: String,
        },
        isOfficial: { type: Boolean, default: false }, // Official/Top Team created by Admin
        isBanned: { type: Boolean, default: false }, // Banned teams cannot participate in tournaments
        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED"],
            default: "PENDING"
        },
    },
    { timestamps: true },
);

// Force model recompilation in development to handle schema changes
if (process.env.NODE_ENV === "development" && mongoose.models.Team) {
    delete mongoose.models.Team;
}

const Team: Model<ITeam> =
    mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);

export default Team;
