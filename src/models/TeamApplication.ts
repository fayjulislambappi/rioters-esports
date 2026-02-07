import mongoose, { Schema, Model, Document } from "mongoose";

export interface ITeamApplication extends Document {
    userId: mongoose.Types.ObjectId;
    teamId: mongoose.Types.ObjectId;
    message: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: Date;
    updatedAt: Date;
}

const TeamApplicationSchema = new Schema<ITeamApplication>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
        message: { type: String, required: true },
        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED"],
            default: "PENDING",
        },
    },
    { timestamps: true },
);

const TeamApplication: Model<ITeamApplication> =
    mongoose.models.TeamApplication ||
    mongoose.model<ITeamApplication>("TeamApplication", TeamApplicationSchema);

export default TeamApplication;
