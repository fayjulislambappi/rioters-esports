import mongoose, { Schema, Model, Document } from "mongoose";

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    image?: string;
    role: "USER" | "TEAM_MANAGER" | "ADMIN";
    provider: "credentials" | "google" | "discord"; // For OAuth support
    teamId?: mongoose.Types.ObjectId;
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
        role: {
            type: String,
            enum: ["USER", "TEAM_MANAGER", "ADMIN"],
            default: "USER",
        },
        provider: {
            type: String,
            enum: ["credentials", "google", "discord"],
            default: "credentials",
        },
        teamId: { type: Schema.Types.ObjectId, ref: "Team" },
        isBanned: { type: Boolean, default: false },
    },
    { timestamps: true },
);

const User: Model<IUser> =
    mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
