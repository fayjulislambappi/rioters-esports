import mongoose, { Schema, Model, Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    image?: string;
    // role: "USER" | "PLAYER" | "TEAM_MEMBER" | "TEAM_CAPTAIN" | "TOURNAMENT_PARTICIPANT" | "ADMIN"; // DEPRECATED
    roles: ("USER" | "PLAYER" | "TEAM_MEMBER" | "TEAM_CAPTAIN" | "TOURNAMENT_PARTICIPANT" | "ADMIN")[];
    role: string; // Keep for compatibility during migration
    provider: "credentials" | "google" | "discord"; // For OAuth support
    // teamId: mongoose.Types.ObjectId; // DEPRECATED: Use teams array
    teams: {
        teamId: mongoose.Types.ObjectId;
        game: string;
        role: "MEMBER" | "CAPTAIN";
    }[];
    isBanned: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, select: false }, // Hide password by default
        image: { type: String },
        role: { type: String, default: "USER" },
        roles: {
            type: [String],
            enum: ["USER", "PLAYER", "TEAM_MEMBER", "TEAM_CAPTAIN", "TOURNAMENT_PARTICIPANT", "ADMIN"],
            default: ["USER"],
        },
        provider: {
            type: String,
            enum: ["credentials", "google", "discord"],
            default: "credentials",
        },
        // teamId: { type: Schema.Types.ObjectId, ref: "Team" }, // DEPRECATED
        teams: [{
            teamId: { type: Schema.Types.ObjectId, ref: "Team" },
            game: { type: String, required: true },
            role: { type: String, enum: ["MEMBER", "CAPTAIN"], default: "MEMBER" }
        }],
        isBanned: { type: Boolean, default: false },
    },
    { timestamps: true },
);

// Force model recompilation in development to handle schema changes
if (process.env.NODE_ENV === "development" && mongoose.models.User) {
    delete mongoose.models.User;
}

const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
