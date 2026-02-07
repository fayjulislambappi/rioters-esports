import mongoose, { Schema, Model, Document } from "mongoose";

export interface ITeam extends Document {
    name: string;
    slug: string;
    logo?: string;
    description?: string;
    captainId: mongoose.Types.ObjectId;
    members: mongoose.Types.ObjectId[]; // Includes captain
    lineup?: string[];
    substitutes?: string[];
    gameFocus?: string; // Primary game they play
    recruiting: boolean;
    socials?: {
        discord?: string;
        twitter?: string;
        website?: string;
    };
}

const TeamSchema = new Schema<ITeam>(
    {
        name: { type: String, required: true, unique: true },
        slug: { type: String, required: true, unique: true, lowercase: true },
        logo: { type: String },
        description: { type: String },
        captainId: { type: Schema.Types.ObjectId, ref: "User", required: false },
        members: [{ type: Schema.Types.ObjectId, ref: "User" }],
        gameFocus: { type: String, required: true },
        recruiting: { type: Boolean, default: false },
        lineup: [{ type: String }], // Main roster IGNs (Captain + 4 others for 5v5)
        substitutes: [{ type: String }], // Array of IGNs for subs
        socials: {
            discord: String,
            twitter: String,
            website: String,
        },
    },
    { timestamps: true },
);

const Team: Model<ITeam> =
    mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);

export default Team;
