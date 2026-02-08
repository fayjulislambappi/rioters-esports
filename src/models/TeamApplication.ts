import mongoose, { Schema, Model, Document } from "mongoose";

export interface ITeamApplication extends Document {
    userId: mongoose.Types.ObjectId;
    teamId: mongoose.Types.ObjectId;
    message?: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    data?: Record<string, string>;
    createdAt: Date;
    updatedAt: Date;
}

const TeamApplicationSchema = new Schema<ITeamApplication>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
        message: { type: String, required: false },
        status: {
            type: String,
            enum: ["PENDING", "APPROVED", "REJECTED"],
            default: "PENDING",
        },
        data: {
            type: Map,
            of: String,
            default: {}
        }
    },
    { timestamps: true },
);

if (mongoose.models.TeamApplication) {
    delete mongoose.models.TeamApplication;
}

const TeamApplication: Model<ITeamApplication> =
    mongoose.model<ITeamApplication>("TeamApplication", TeamApplicationSchema);

export default TeamApplication;
